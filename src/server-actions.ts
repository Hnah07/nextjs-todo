"use server";

import { addTodo, deleteTodo, toggleTodo } from "./queries";
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
