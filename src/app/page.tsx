"use client";

import { useState } from "react";
import { TodoListItem } from "@/components/todoListItem";
import { AddTodoItem } from "@/components/addTodoItem";

interface Todo {
  id: string;
  title: string;
  description?: string;
}

const HomePage = () => {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      title:
        "TODOTODOTODOTODOTO DOTODOTODOTODOTODOTODOTO DOTODOTODOTODOTODO TODOTODOTODOTODOTODO",
    },
  ]);

  const handleAddTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(), // Simple way to generate unique IDs
      title,
    };
    setTodos([...todos, newTodo]);
  };

  return (
    <>
      <AddTodoItem onAdd={handleAddTodo} />
      {todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          title={todo.title}
          description={todo.description}
        />
      ))}
    </>
  );
};

export default HomePage;
