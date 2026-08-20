"use client";

import { useEffect, useState, type FormEvent } from "react";

type Todo = {
  id: string;
  title: string;
};

const STORAGE_KEY = "to-do-poc:items";

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const todo = value as Partial<Todo>;
  return typeof todo.id === "string" && typeof todo.title === "string";
}

function createTodoId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedTodos = window.localStorage.getItem(STORAGE_KEY);
      const parsedTodos: unknown = storedTodos ? JSON.parse(storedTodos) : [];

      if (Array.isArray(parsedTodos)) {
        setTodos(parsedTodos.filter(isTodo));
      }
    } catch {
      setTodos([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Storage can be unavailable in a browser's private mode.
    }
  }, [isReady, todos]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setTodos((currentTodos) => [
      {
        id: createTodoId(),
        title: trimmedTitle,
      },
      ...currentTodos,
    ]);
    setTitle("");
  }

  return (
    <main className="page-shell">
      <section className="todo-app" aria-labelledby="page-title">
        <header className="app-header">
          <div>
            <p className="eyebrow">Personal list</p>
            <h1 id="page-title">Things to do.</h1>
            <p className="subtitle">Keep the next small thing in view.</p>
          </div>
          <p className="item-count" aria-live="polite">
            {todos.length} {todos.length === 1 ? "item" : "items"}
          </p>
        </header>

        <form className="composer" onSubmit={handleSubmit}>
          <label htmlFor="todo-title">New item</label>
          <div className="composer-row">
            <input
              id="todo-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add something..."
              maxLength={140}
              autoComplete="off"
              disabled={!isReady}
            />
            <button type="submit" disabled={!isReady || !title.trim()}>
              Add todo
            </button>
          </div>
        </form>

        <section className="todo-list-section" aria-labelledby="list-title">
          <div className="list-heading">
            <h2 id="list-title">All items</h2>
            <span>{isReady ? "Saved locally" : "Loading"}</span>
          </div>

          {!isReady ? (
            <p className="empty-state">Loading your list...</p>
          ) : todos.length === 0 ? (
            <p className="empty-state">Your list is clear. Add the first item above.</p>
          ) : (
            <ol className="todo-list">
              {todos.map((todo, index) => (
                <li key={todo.id}>
                  <span className="item-number">{String(index + 1).padStart(2, "0")}</span>
                  <span>{todo.title}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </section>
    </main>
  );
}