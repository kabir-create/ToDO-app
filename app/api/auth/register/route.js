import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = db.createUser({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString(),
    });

    // ✅ Seed demo boards & tasks for new user
    db.seedDemoData(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Respond with user and token
    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
