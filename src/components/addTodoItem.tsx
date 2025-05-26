"use client";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/helpers";
import { handleAddTodo } from "@/server-actions";
import { useActionState } from "react";
import { useRef } from "react";
import type { ServerFeedback } from "@/types";
import { toast } from "sonner";

export const AddTodoItem = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [, action, isPending] = useActionState(
    async (state: ServerFeedback, formData: FormData) => {
      const result = await handleAddTodo(formData);
      if (result.type === "success") {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      return result;
    },
    { type: "", message: "" }
  );

  return (
    <form action={action} className="flex flex-col w-full">
      <div className="flex gap-4 w-full">
        <Input
          ref={inputRef}
          name="todo"
          type="text"
          className="w-full"
          placeholder="Add a new todo..."
        />
        <SubmitButton isPending={isPending} />
      </div>
    </form>
  );
};
