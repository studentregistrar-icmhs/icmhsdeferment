import { Suspense } from "react";
import { cookies } from "next/headers";
import { isValidSessionCookie, SESSION_COOKIE } from "../../lib/auth";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";
import LogoutButtonClient from "./LogoutButtonClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
            <h1>Registrar Review</h1>
            <div className="sub">Imperial College of Medical and Health Sciences</div>
          </div>
        </div>
                {authed && <LogoutButtonClient />}
                  </div>

                  {authed && (
                    <div className="settings-nav">
                      <a href="/admin/settings" className="tab-btn">Deadline Settings &rarr;</a>
                    </div>
                  )}

                  {authed ? <Dashboard /> : <Suspense fallback={null}><LoginForm /></Suspense>}
    </div>
  );
}
