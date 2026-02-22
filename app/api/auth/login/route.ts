import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUser = process.env.APP_USERNAME;
  const validPass = process.env.APP_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!validUser || !validPass || !sessionSecret) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ success: true });
    // Set a secure session cookie (7 days)
    res.cookies.set("ept_session", sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  }

  return NextResponse.json(
    { error: "Incorrect username or password." },
    { status: 401 },
  );
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("ept_session", "", { maxAge: 0, path: "/" });
  return res;
}
