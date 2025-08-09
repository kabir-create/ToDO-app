import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { title, description, boardId, dueDate } = await req.json();
    if (!title || !boardId) {
      return NextResponse.json(
        { error: "Title and boardId are required" },
        { status: 400 }
      );
    }

    // Ensure the board belongs to this user
    const board = db.findBoardById(boardId);
    if (!board || board.userId !== decoded.userId) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const newTask = db.createTask({
      title: title.trim(),
      description: description?.trim() || "",
      boardId: board.id,
      dueDate: dueDate || null,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
