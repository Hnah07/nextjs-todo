import { AddTodoItem } from "@/components/addTodoItem";
import { TodoListItem } from "@/components/todoListItem";
import { getTodos } from "@/queries";

async function HomePage() {
  const todos = await getTodos();

  return (
    <>
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
