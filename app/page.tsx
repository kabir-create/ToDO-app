"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Board {
  id: number;
  name: string;
  description?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchBoards();
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchBoards = async () => {
    try {
      const res = await fetch("/api/boards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch boards (${res.status})`);
      }

      const data = await res.json();
      setBoards(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 space-y-6">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>

        {error && (
          <div className="text-red-600 bg-red-100 p-4 rounded">{error}</div>
        )}

        {loading ? (
          <p>Loading boards...</p>
        ) : (
          <div className="grid gap-4">
            {boards.length === 0 ? (
              <p>No boards yet. Create your first board.</p>
            ) : (
              boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="block p-4 border rounded hover:shadow"
                >
                  <h2 className="text-xl font-semibold">{board.name}</h2>
                  <p className="text-gray-500">{board.description}</p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
