import { AddTodoItem } from "@/components/addTodoItem";
import { TodoListItem } from "@/components/todoListItem";
import { getTodos } from "@/queries";

async function HomePage() {
  const todos = await getTodos();

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Not another todo list</h1>
      <AddTodoItem />
      {todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          id={todo.id}
          todo={todo.todo}
          photo_url={todo.photo_url}
          completed={todo.completed}
        />
      ))}
    </>
  );
}

export default HomePage;
