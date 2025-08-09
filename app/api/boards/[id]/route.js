import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req, context) {
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

  const board = db.findBoardById(Number(id));
  if (!board || board.userId !== decoded.userId) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(board);
}

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

  const { name, description } = await req.json();
  const updatedBoard = db.updateBoard(Number(id), {
    name,
    description,
  });
  if (!updatedBoard) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(updatedBoard);
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

  const success = db.deleteBoard(Number(id));
  if (!success) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Board deleted successfully" });
}
