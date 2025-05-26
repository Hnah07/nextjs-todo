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
          title={todo.todo}
          description={todo.photo_url}
        />
      ))}
    </>
  );
}

export default HomePage;
