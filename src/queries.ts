"use server";
import { connect } from "./connect";
import { TodoDB } from "./types";
import { Todo } from "./types";

// Get all todos
export async function getTodos(): Promise<Todo[]> {
  try {
    const connection = await connect();
    const [rows] = await connection.query<TodoDB[]>("SELECT * FROM todos");
    return rows.map((row) => ({
      ...row,
      completed: row.completed === 1,
    }));
  } catch (error) {
    throw error;
  }
}

// Add a new todo
export async function addTodo(todo: string, photo_url: string): Promise<void> {
  try {
    const connection = await connect();
    await connection.query(
      "INSERT INTO todos (todo, photo_url, completed) VALUES (?, ?, ?)",
      [todo, photo_url, false]
    );
  } catch (error) {
    throw error;
  }
}

// Delete a todo
export async function deleteTodo(id: number): Promise<void> {
  try {
    const connection = await connect();
    await connection.query("SELECT * FROM todos WHERE id = ?", [id]);
  } catch (error) {
    throw error;
  }
}

// Toggle todo completion status
export async function toggleTodo(id: number): Promise<void> {
  try {
    const connection = await connect();
    await connection.query(
      "UPDATE todos SET completed = NOT completed WHERE id = ?",
      [id]
    );
  } catch (error) {
    throw error;
  }
}

// Update todo text
export async function updateTodo(
  id: number,
  todo: string,
  photo_url: string
): Promise<void> {
  try {
    const connection = await connect();
    await connection.query(
      "UPDATE todos SET todo = ?, photo_url = ? WHERE id = ?",
      [todo, photo_url, id]
    );
  } catch (error) {
    throw error;
  }
}
