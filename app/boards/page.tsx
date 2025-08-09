"use client";

import { useEffect, useState } from "react";
import BoardForm from "../components/boardform";

interface Board {
  id: number;
  name: string;
  description?: string;
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState<string>("");

  // Fetch boards
  const fetchBoards = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/boards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setBoards(data);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    fetchBoards();
  }, []);

  // Handle new board creation
  const handleBoardCreated = (newBoard: Board) => {
    setBoards((prev) => [...prev, newBoard]);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {userName || "User"}!</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Create Board
        </button>
      </div>

      {boards.length === 0 ? (
        <p>No boards yet. Create your first board.</p>
      ) : (
        <div className="space-y-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="p-4 border rounded shadow hover:shadow-md cursor-pointer"
            >
              <h2 className="font-bold">{board.name}</h2>
              <p className="text-sm text-gray-600">{board.description}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BoardForm
          onClose={() => setShowForm(false)}
          onSuccess={handleBoardCreated}
        />
      )}
    </div>
  );
}
