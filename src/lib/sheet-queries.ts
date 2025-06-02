"use server";

import { revalidatePath } from "next/cache";
import { Todo, SheetRow } from "../types";

async function getBaseUrl() {
  // Use NEXT_PUBLIC_VERCEL_URL in production, fallback to localhost in development
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
  return `${baseUrl}/api/sheet`;
}

async function fetchSheetData() {
  const baseUrl = await getBaseUrl();
  console.log("Fetching from URL:", baseUrl);

  try {
    const response = await fetch(baseUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    });

    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Sheet API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Response data:", data);
    if (data.error) {
      throw new Error(data.message || "Sheet API returned an error");
    }

    // Convert todos array to rows format for consistency
    const rows: SheetRow[] = data.todos.map((todo: Todo) => [
      todo.id.toString(),
      todo.todo,
      todo.photo_url || "",
      todo.completed ? "TRUE" : "FALSE",
    ]);

    return { rows };
  } catch (error) {
    console.error("Sheet API fetch error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch sheet data: ${error.message}`);
    }
    throw new Error("Failed to fetch sheet data: Unknown error");
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
