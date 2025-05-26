"use server";

import { addTodo } from "./queries";
import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

export const handleDelete = async () => {
  // TODO: Implement delete functionality
  console.log("Deleting todo...");
};

export const handleAddTodo = async (title: string): Promise<Todo> => {
  const newTodo = await addTodo(title.trim());
  revalidatePath("/");
  return newTodo;
};
