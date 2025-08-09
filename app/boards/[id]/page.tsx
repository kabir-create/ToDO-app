"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Task = {
  id: number;
  title: string;
  status: string;
};

export default function BoardDetail() {
  const params = useParams();
  const boardId = params?.id;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchTasks() {
    const res = await fetch(`/api/boards/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data.tasks || []);
  }

  async function createTask() {
    if (!title) return;
    await fetch(`/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boardId: Number(boardId), title }),
    });
    setTitle("");
    fetchTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Tasks</h1>
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-1"
        />
        <button onClick={createTask} className="bg-green-500 text-white px-2 py-1">
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="border p-2 flex justify-between">
              <span>{task.title}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white px-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
