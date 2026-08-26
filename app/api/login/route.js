import { NextResponse } from "next/server";
import { isCorrectPassword, makeSessionToken, SESSION_COOKIE } from "../../../lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.REGISTRAR_PASSWORD || !process.env.SESSION_SECRET) {
    console.error(
      "Login route misconfigured: REGISTRAR_PASSWORD or SESSION_SECRET is missing from this environment."
    );
    return NextResponse.json(
      { error: "Server is not fully configured yet. Set REGISTRAR_PASSWORD and SESSION_SECRET in Vercel, then redeploy." },
      { status: 500 }
    );
  }

  const password = body.password || "";

  if (!isCorrectPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  try {
    const token = makeSessionToken(password);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8 // 8 hours
    });
    return res;
  } catch (err) {
    console.error("Login token signing failed:", err);
    return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 });
  }
}
