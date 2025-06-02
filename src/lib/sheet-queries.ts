"use server";

import { revalidatePath } from "next/cache";
import { Todo } from "../types";

type SheetRow = [string, string, string, string];

const BASE_URL = "http://localhost:3000/api/sheet";

async function fetchSheetData() {
  const response = await fetch(BASE_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sheet data");
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.message || "Failed to fetch sheet data");
  }

  return {
    headers: data.headers,
    rows: data.rows as SheetRow[],
  };
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
  const data = await fetchSheetData();
  const lastRow = data.rows[data.rows.length - 1];
  const newId = lastRow ? parseInt(lastRow[0]) + 1 : 1;

  const response = await fetch(BASE_URL, {
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
  const response = await fetch(BASE_URL, {
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
  const response = await fetch(BASE_URL, {
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
  const response = await fetch(BASE_URL, {
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
