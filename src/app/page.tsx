import { AddTodoItem } from "@/components/addTodoItem";
import { TodoListItem } from "@/components/todoListItem";
import { getTodos } from "@/lib/sheet-queries";

async function HomePage() {
  try {
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
  } catch (error) {
    console.error("Error loading todos:", error);
    return (
      <>
        <h1 className="text-2xl font-bold mb-4">Not another todo list</h1>
        <div className="text-red-500">
          Failed to load todos. Please try again later.
        </div>
        <AddTodoItem />
      </>
    );
  }
}

export default HomePage;
