"use client";

import { useState } from "react";

const initialState = {
  fullName: "",
  studentId: "",
  email: "",
  phone: "",
  program: "",
  campus: "",
  originalIntake: "",
  originalYear: "",
  deferredIntake: "",
  deferredYear: "",
  reasonCategory: "",
  reasonDetails: "",
  supportingNotes: "",
  signedName: "",
  declare: false
};

export default function ApplyPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedId, setConfirmedId] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setConfirmedId(data.id);
    } catch (err) {
      setError(err.message || "Something went wrong saving your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedId) {
    return (
      <div className="wrap">
        <Letterhead />
        <div className="confirm">
          <div className="stamp">On<br />File</div>
          <h3>Request received</h3>
          <p>Your deferment request has been logged with the ICMHS Office of Admissions &amp; Records.</p>
          <p className="id">Reference number: {confirmedId}</p>
          <div style={{ marginTop: 18 }}>
            <button
              className="primary"
              type="button"
              onClick={() => {
                setForm(initialState);
                setConfirmedId(null);
              }}
            >
              Submit another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Letterhead />
      <div className="doc">
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <div className="num">01</div>
            <h2>Applicant Information</h2>
            <div className="row">
              <div className="field">
                <label>Full Name <span className="req">*</span></label>
                <input type="text" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div className="field">
                <label>Admission Number</label>
                <input type="text" placeholder="DPTT/S-0000/IC/26" required value={form.studentId} onChange={(e) => update("studentId", e.target.value)} />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Email address <span className="req">*</span></label>
                <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="field">
                <label>Phone number <span className="req">*</span></label>
                <input type="tel" required placeholder="07XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="field-group">
            <div className="num">02</div>
            <h2>Program &amp; Campus</h2>
            <div className="field">
              <label>Program applied to <span className="req">*</span></label>
              <select required value={form.program} onChange={(e) => update("program", e.target.value)}>
                <option value="">Select a program…</option>
                <optgroup label="Diploma Programs">
                  <option>Diploma in Clinical Medicine and Surgery</option>
                  <option>Diploma in Kenya Registered Community Health Nursing</option>
                  <option>Diploma in Biomedical Engineering Technology</option>
                  <option>Diploma in Perioperative Theatre Technology</option>
                  <option>Diploma in Human Nutrition and Dietetics</option>
                  <option>Diploma in Health Records and Information Technology</option>
                  <option>Diploma in Community Health</option>
                  <option>Diploma in Counseling Psychology</option>
                  <option>Diploma in Social Work and Community Development</option>
                  <option>Diploma in Information Technology</option>
                </optgroup>
                <optgroup label="Certificate Programs">
                  <option>Certificate in Community Health</option>
                  <option>Certificate in Perioperative Theatre Technology</option>
                  <option>Certificate in Health Records and Information Technology</option>
                  <option>Certificate in Science Laboratory Technology</option>
                  <option>Certificate in Human Nutrition and Dietetics</option>
                  <option>Certificate in Social Work and Community Development</option>
                  <option>Certificate in Healthcare Support</option>
                  <option>Caregiving Level 4</option>
                </optgroup>
              </select>
            </div>
            <div className="field">
              <label>Campus <span className="req">*</span></label>
              <select required value={form.campus} onChange={(e) => update("campus", e.target.value)}>
                <option value="">Select a campus…</option>
                <option>Thika Main Campus</option>
                <option>Nakuru Campus</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <div className="num">03</div>
            <h2>Semester Deferring Details</h2>
            <div className="row3">
              <div className="field">
                <label>Original intake <span className="req">*</span></label>
                <select required value={form.originalIntake} onChange={(e) => update("originalIntake", e.target.value)}>
                  <option value="">Select…</option>
                  <option>January Intake</option>
                  <option>May Intake</option>
                  <option>September Intake</option>
                </select>
              </div>
              <div className="field">
                <label>Original year <span className="req">*</span></label>
                <input type="number" required min="2024" max="2035" placeholder="2026" value={form.originalYear} onChange={(e) => update("originalYear", e.target.value)} />
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label>Requested deferred intake <span className="req">*</span></label>
                <select required value={form.deferredIntake} onChange={(e) => update("deferredIntake", e.target.value)}>
                  <option value="">Select…</option>
                  <option>January Intake</option>
                  <option>May Intake</option>
                  <option>September Intake</option>
                </select>
              </div>
              <div className="field">
                <label>Deferred year <span className="req">*</span></label>
                <input type="number" required min="2024" max="2035" placeholder="2027" value={form.deferredYear} onChange={(e) => update("deferredYear", e.target.value)} />
              </div>
            </div>
            <div className="hint">ICMHS admits three times a year — January, May, and September intakes.</div>
          </div>

          <div className="field-group">
            <div className="num">04</div>
            <h2>Reason for Deferment</h2>
            <div className="field">
              <label>Category <span className="req">*</span></label>
              <select required value={form.reasonCategory} onChange={(e) => update("reasonCategory", e.target.value)}>
                <option value="">Select one…</option>
                <option>Financial hardship</option>
                <option>Medical or health circumstances</option>
                <option>Personal or family circumstances</option>
                <option>Immigration or visa delay</option>
                <option>Employment or work obligation</option>
                <option>Did not meet admission requirements in time</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Explanation <span className="req">*</span></label>
              <textarea required placeholder="Describe your circumstances and why a deferment is needed." value={form.reasonDetails} onChange={(e) => update("reasonDetails", e.target.value)} />
            </div>
          </div>

          <div className="field-group">
            <div className="num">05</div>
            <h2>Supporting Documentation</h2>
            <div className="field">
              <label>Documents you will provide to the registrar</label>
              <textarea placeholder="e.g. Doctor's letter, employer confirmation, KCSE result slip. Files are submitted separately via email or in person at the campus admissions office." value={form.supportingNotes} onChange={(e) => update("supportingNotes", e.target.value)} />
            </div>
          </div>

          <div className="field-group">
            <div className="num">06</div>
            <h2>Declaration</h2>
            <div className="declaration">
              <input type="checkbox" required checked={form.declare} onChange={(e) => update("declare", e.target.checked)} id="declare" />
              <label htmlFor="declare" style={{ margin: 0 }}>
                I certify that the information provided in this request is accurate and complete to the best of my knowledge, and I understand that a deferment does not guarantee admission under future terms. I understand ICMHS programs are regulated by TVETA and relevant professional bodies.
              </label>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Typed signature (full name) <span className="req">*</span></label>
              <input type="text" required value={form.signedName} onChange={(e) => update("signedName", e.target.value)} />
            </div>
            <div className="badge-row">
              <span className="accred-badge">TVETA Accredited</span>
              <span className="accred-badge">NCK Recognized</span>
              <span className="accred-badge">Thika &amp; Nakuru Campuses</span>
            </div>
          </div>

          <div className="submit-row">
            <div className="note">Submissions are reviewed by the ICMHS Office of Admissions &amp; Records.</div>
            <button className="primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
        {error && <div className="err" style={{ padding: "0 26px 16px" }}>{error}</div>}
      </div>
    </div>
  );
}

function Letterhead() {
  return (
    <div className="letterhead">
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="logo" src="https://images.icmhs.co.ke/admin/janus/files/icmhs_new_logo.webp" alt="ICMHS logo" onError={(e) => (e.currentTarget.style.display = "none")} />
        <div>
          <div className="eyebrow">Office of Admissions &amp; Records</div>
          <h1>Enrollment Deferment Request</h1>
          <div className="sub">Imperial College of Medical and Health Sciences</div>
        </div>
      </div>
      <div className="ref">Form ICMHS-AD/14<br />Session 2026</div>
    </div>
  );
}
