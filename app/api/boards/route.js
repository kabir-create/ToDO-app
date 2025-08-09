import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// ===== GET: Fetch boards (auto-seed demo data if empty) =====
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.log("❌ No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    console.log("✅ Decoded token:", decoded);

    if (!decoded?.userId) {
      console.log("❌ Invalid token payload");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Auto-seed demo boards if none exist
    let boards = db.getBoardsByUserId(decoded.userId) || [];
    if (boards.length === 0) {
      console.log("🌱 No boards found — seeding demo data...");
      db.seedDemoData(decoded.userId);
      boards = db.getBoardsByUserId(decoded.userId);
    }

    console.log(`📋 Returning ${boards.length} boards for user ${decoded.userId}`);
    return NextResponse.json(boards, { status: 200 });

  } catch (err) {
    console.error("🔥 GET /api/boards error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ===== POST: Create a new board =====
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

    const { name, description } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Board name is required" },
        { status: 400 }
      );
    }

    const newBoard = db.createBoard({
      name: name.trim(),
      description: description?.trim() || "",
      userId: decoded.userId,
    });

    console.log("✅ Created board:", newBoard);
    return NextResponse.json(newBoard, { status: 201 });

  } catch (err) {
    console.error("🔥 POST /api/boards error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
