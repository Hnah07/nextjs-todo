"use server";

import { revalidatePath } from "next/cache";
import { Todo } from "../types";
import { headers } from "next/headers";

type SheetRow = [string, string, string, string];

async function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return `${
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
    }/api/sheet`;
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}/api/sheet`;
}

async function fetchSheetData() {
  const baseUrl = await getBaseUrl();
  console.log("Fetching from URL:", baseUrl);

  try {
    const response = await fetch(baseUrl, {
      cache: "no-store",
    });

    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to fetch sheet data: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Response data:", data);
    if (data.error) {
      throw new Error(data.message || "Failed to fetch sheet data");
    }

    return {
      headers: data.headers,
      rows: data.rows as SheetRow[],
    };
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getTodos(): Promise<Todo[]> {
  const data = await fetchSheetData();

  return data.rows.map((row) => ({
    id: parseInt(row[0]),
    todo: row[1],
    photo_url: row[2] || "",
    completed: row[3] === "TRUE" || row[3] === "true" || row[3] === "1",
  }));
}

export async function addTodo(
  todo: string,
  photo_url: string = ""
): Promise<Todo> {
  const baseUrl = await getBaseUrl();

  const data = await fetchSheetData();
  const lastRow = data.rows[data.rows.length - 1];
  const newId = lastRow ? parseInt(lastRow[0]) + 1 : 1;

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "add",
      data: {
        id: newId,
        todo,
        photo_url,
        completed: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add todo");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.message || "Failed to add todo");
  }

  revalidatePath("/");
  return result.data;
}

export async function deleteTodo(id: number): Promise<void> {
  const baseUrl = await getBaseUrl();

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "delete",
      id,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.message || "Failed to delete todo");
  }

  revalidatePath("/");
}

export async function toggleTodo(
  id: number,
  completed: boolean
): Promise<Todo> {
  const baseUrl = await getBaseUrl();

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "toggle",
      id,
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update todo status");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.message || "Failed to update todo status");
  }

  revalidatePath("/");
  return result.data;
}

export async function updateTodo(
  id: number,
  todo: string,
  photo_url: string
): Promise<Todo> {
  const baseUrl = await getBaseUrl();

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "update",
      id,
      todo,
      photo_url,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update todo");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.message || "Failed to update todo");
  }

  revalidatePath("/");
  return result.data;
}
