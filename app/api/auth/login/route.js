import { NextResponse } from "next/server";
import db from "@/lib/db";
import { comparePasswords, generateToken } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const isValidPassword = await comparePasswords(password, user.password);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  // ✅ Seed demo boards/tasks if none exist
  db.seedDemoData(user.id);

  const token = generateToken(user.id);

  return NextResponse.json({
    message: "Login successful",
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
