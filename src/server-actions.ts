"use server";

import { addTodo, deleteTodo, toggleTodo, updateTodo } from "./queries";
import { revalidatePath } from "next/cache";
import type { ServerFeedback } from "./types";

export const handleDelete = async (id: number): Promise<ServerFeedback> => {
  try {
    await deleteTodo(id);
    return { type: "success", message: "Todo deleted successfully" };
  } catch {
    return { type: "error", message: "Failed to delete todo" };
  }
};

export const handleAddTodo = async (
  formData: FormData
): Promise<ServerFeedback> => {
  const str = formData.get("todo") as string;
  if (str.trim().length === 0) {
    return { type: "error", message: "Todo cannot be empty" };
  }
  if (str.trim().length > 100) {
    return {
      type: "error",
      message: "Todo cannot be longer than 100 characters",
    };
  }

  try {
    await addTodo(str.trim());
    return { type: "success", message: "Todo added successfully" };
  } catch {
    return { type: "error", message: "Failed to add todo" };
  }
};

export const handleToggleComplete = async (
  id: number,
  completed: boolean
): Promise<ServerFeedback> => {
  try {
    await toggleTodo(id, completed);
    revalidatePath("/");
    return {
      type: "success",
      message: completed
        ? "Todo marked as complete"
        : "Todo marked as incomplete",
    };
  } catch {
    return { type: "error", message: "Failed to update todo status" };
  }
};

export const handleUpdateTodo = async (
  id: number,
  todo: string,
  photo_url: string
): Promise<ServerFeedback> => {
  try {
    await updateTodo(id, todo, photo_url);
    revalidatePath("/");
    return { type: "success", message: "Todo updated successfully" };
  } catch {
    return { type: "error", message: "Failed to update todo" };
  }
};
