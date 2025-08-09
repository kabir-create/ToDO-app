"use client";

import { useState, useEffect } from "react";
import TaskForm from "./taskform";

export default function TaskList({ boardId }: { boardId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/boards/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const board = await res.json();
      setTasks(board.tasks || []);
    }
  };

  const toggleStatus = async (taskId: number, current: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: current === "done" ? "pending" : "done" }),
    });
    fetchTasks();
  };

  const deleteTask = async (taskId: number) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [boardId]);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          + Add Task
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <p className={task.status === "done" ? "line-through" : ""}>
                {task.title}
              </p>
              <small className="text-gray-500">
                Due: {task.dueDate || "No date"}
              </small>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(task.id, task.status)}
                className="px-2 py-1 border rounded"
              >
                {task.status === "done" ? "Undo" : "Done"}
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="px-2 py-1 border rounded text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <TaskForm
          boardId={boardId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
