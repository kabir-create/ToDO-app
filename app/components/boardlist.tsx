"use client";

import { useState, useEffect } from "react";
import BoardForm from "./boardform";
import { useRouter } from "next/navigation";

export default function BoardList() {
  const [boards, setBoards] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const fetchBoards = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/boards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBoards(await res.json());
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Boards</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Board
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="p-4 border rounded shadow hover:shadow-md cursor-pointer bg-white"
            onClick={() => router.push(`/boards/${board.id}`)}
          >
            <h3 className="font-bold">{board.name}</h3>
            <p className="text-sm text-gray-600">{board.description}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <BoardForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchBoards();
          }}
        />
      )}
    </div>
  );
}
