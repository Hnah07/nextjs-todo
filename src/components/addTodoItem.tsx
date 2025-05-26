"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AddTodoItemProps {
  onAdd: (title: string) => void;
}

export const AddTodoItem = ({ onAdd }: AddTodoItemProps) => {
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="flex gap-4 w-full">
      <Input
        type="text"
        className="w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Add a new todo..."
      />
      <Button
        variant="outline"
        className="rounded-full w-10 h-10"
        onClick={handleAdd}
      >
        +
      </Button>
    </div>
  );
};
