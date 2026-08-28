import { Suspense } from "react";
import { cookies } from "next/headers";
import { isValidSessionCookie, SESSION_COOKIE } from "../../../lib/auth";
import LoginForm from "../LoginForm";
import LogoutButtonClient from "../LogoutButtonClient";
import DeadlineSettings from "./DeadlineSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  let authed = false;
  try {
    authed = isValidSessionCookie(session);
  } catch (err) {
    console.error("Session check failed (likely missing SESSION_SECRET):", err);
    authed = false;
  }

  return (
    <div className="wrap">
      <div className="letterhead">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="logo"
            src="https://images.icmhs.co.ke/admin/janus/files/icmhs_new_logo.webp"
            alt="ICMHS logo"
          />
          <div>
            <div className="eyebrow">Office of the Registrar of Students</div>
            <h1>Deferment Deadline Settings</h1>
            <div className="sub">Imperial College of Medical and Health Sciences</div>
          </div>
        </div>
        {authed && <LogoutButtonClient />}
      </div>

      {authed && (
        <div className="settings-nav">
          <a href="/admin" className="tab-btn">&larr; Back to Dashboard</a>
        </div>
      )}

      {authed ? <DeadlineSettings /> : <Suspense fallback={null}><LoginForm /></Suspense>}
    </div>
  );
}
