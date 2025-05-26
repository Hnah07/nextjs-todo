"use server";

import { revalidatePath } from "next/cache";
import { connect } from "./connect";
import { ResultSetHeader } from "mysql2";
import { Todo } from "./types";

// Get all todos
export async function getTodos(): Promise<Todo[]> {
  const connection = await connect();
  const [rows] = await connection.execute("SELECT * FROM todos");
  return rows as Todo[];
}

// Add a new todo
export async function addTodo(
  title: string,
  photo_url: string = ""
): Promise<Todo> {
  const connection = await connect();
  const [result] = await connection.execute<ResultSetHeader>(
    "INSERT INTO todos (title, photo_url, completed) VALUES (?, ?, ?)",
    [title, photo_url, false]
  );

  const [newTodo] = await connection.execute(
    "SELECT * FROM todos WHERE id = ?",
    [result.insertId]
  );

  revalidatePath("/");
  return (newTodo as Todo[])[0];
}

// Delete a todo
export async function deleteTodo(id: number): Promise<void> {
  const connection = await connect();
  await connection.execute("DELETE FROM todos WHERE id = ?", [id]);
  revalidatePath("/");
}

// Toggle todo completion status
export async function toggleTodo(
  id: number,
  completed: boolean
): Promise<Todo> {
  const connection = await connect();
  await connection.execute("UPDATE todos SET completed = ? WHERE id = ?", [
    completed,
    id,
  ]);

  const [updatedTodo] = await connection.execute(
    "SELECT * FROM todos WHERE id = ?",
    [id]
  );

  revalidatePath("/");
  return (updatedTodo as Todo[])[0];
}

// Update todo text
export async function updateTodo(
  id: number,
  title: string,
  photo_url: string
): Promise<Todo> {
  const connection = await connect();
  await connection.execute(
    "UPDATE todos SET title = ?, photo_url = ? WHERE id = ?",
    [title, photo_url, id]
  );

  const [updatedTodo] = await connection.execute(
    "SELECT * FROM todos WHERE id = ?",
    [id]
  );

  revalidatePath("/");
  return (updatedTodo as Todo[])[0];
}
