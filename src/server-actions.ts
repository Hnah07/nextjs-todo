"use server";

import { addTodo, deleteTodo, toggleTodo, updateTodo } from "./queries";
import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

export const handleDelete = async (id: number) => {
  await deleteTodo(id);
  revalidatePath("/");
};

export const handleAddTodo = async (todo: string): Promise<Todo> => {
  const newTodo = await addTodo(todo.trim());
  revalidatePath("/");
  return newTodo;
};

export const handleToggleComplete = async (id: number, completed: boolean) => {
  await toggleTodo(id, completed);
  revalidatePath("/");
};

export const handleUpdateTodo = async (
  id: number,
  todo: string,
  photo_url: string
) => {
  await updateTodo(id, todo, photo_url);
  revalidatePath("/");
};
