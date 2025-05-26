"use client";

import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { handleAddTodo } from "@/server-actions";
import { SubmitButton } from "@/helpers";

export const AddTodoItem = () => {
  const { pending } = useFormStatus();

  return (
    <form
      action={async (formData: FormData) => {
        const todo = formData.get("todo") as string;
        if (!todo.trim()) return;

        await handleAddTodo(todo);
      }}
      className="flex flex-col w-full"
    >
      <div className="flex gap-4 w-full">
        <Input
          name="todo"
          type="text"
          className="w-full"
          placeholder="Add a new todo..."
          disabled={pending}
        />
        <SubmitButton />
      </div>
    </form>
  );
};
