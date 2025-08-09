import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(req, context) {
  const { id } = await context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const task = db.findTaskById(Number(id));
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const board = db.findBoardById(task.boardId);
  if (!board || board.userId !== decoded.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const updates = await req.json();
  const updatedTask = db.updateTask(task.id, updates);

  return NextResponse.json(updatedTask, { status: 200 });
}

export async function DELETE(req, context) {
  const { id } = await context.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const task = db.findTaskById(Number(id));
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const board = db.findBoardById(task.boardId);
  if (!board || board.userId !== decoded.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  db.deleteTask(task.id);
  return NextResponse.json({ message: "Task deleted" }, { status: 200 });
}
