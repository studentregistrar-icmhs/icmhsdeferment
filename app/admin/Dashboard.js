"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load requests.");
      setRequests(data.requests);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  if (loading) return <div className="loading">Loading requests…</div>;
  if (loadError) return <div className="empty">{loadError}</div>;

  return (
    <div>
      <div className="filters">
        {["all", "pending", "approved", "denied"].map((f) => (
          <button
            key={f}
            className={"chip" + (filter === f ? " active" : "")}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No requests here yet.</div>
      ) : (
        <div className="ledger">
          {filtered.map((r) => (
            <Entry
              key={r.id}
              record={r}
              open={openId === r.id}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
              onUpdated={(updated) => {
                setRequests((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Entry({ record, open, onToggle, onUpdated }) {
  const [notes, setNotes] = useState(record.reviewer_notes || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function setStatus(status) {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/requests/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewerNotes: notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update request.");
      onUpdated(data.request);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="entry">
      <div className="entry-head" onClick={onToggle}>
        <div>
          <div className="name">{record.full_name || "Unnamed applicant"}</div>
          <div className="meta">
            {record.id} · {record.program} · {record.campus} · filed{" "}
            {new Date(record.submitted_at).toLocaleDateString()}
          </div>
        </div>
        <div className={`status-badge status-${record.status}`}>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </div>
      </div>

      {open && (
        <div className="entry-body">
          <div className="detail-grid">
            <Detail k="Student ID" v={record.student_id} />
            <Detail k="Email" v={record.email} />
            <Detail k="Phone" v={record.phone} />
            <Detail k="Campus" v={record.campus} />
            <Detail k="Reason category" v={record.reason_category} />
            <Detail k="Original intake" v={`${record.original_intake} ${record.original_year}`} />
            <Detail k="Requested intake" v={`${record.deferred_intake} ${record.deferred_year}`} />
            <Detail full k="Explanation" v={record.reason_details} />
            <Detail full k="Supporting documentation notes" v={record.supporting_notes} />
            <Detail full k="Signed by" v={record.signed_name} />
          </div>

          <div className="review-controls">
            <label>Reviewer notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes for this request" />
            <div className="action-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button className="approve" disabled={saving} onClick={() => setStatus("approved")}>Approve</button>
              <button className="deny" disabled={saving} onClick={() => setStatus("denied")}>Deny</button>
              <button className="reset" disabled={saving} onClick={() => setStatus("pending")}>Reset to Pending</button>
              
              {/* PDF EXPORT BUTTON INTEGRATION */}
              <a
                href={`/api/applications/${record.id}/export`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button type="button" style={{ cursor: 'pointer' }}>Export PDF</button>
              </a>

              {err && <span className="err">{err}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ k, v, full }) {
  return (
    <div className={full ? "detail-full" : ""}>
      <div className="k">{k}</div>
      <div className="v">{v || "—"}</div>
    </div>
  );
}
