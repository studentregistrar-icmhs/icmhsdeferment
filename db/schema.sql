-- Run this once against your Vercel Postgres database before first use.
-- (Vercel dashboard > Storage > your database > Query, paste this in, run it.)

CREATE TABLE IF NOT EXISTS deferment_requests (
  id               TEXT PRIMARY KEY,
  full_name        TEXT NOT NULL,
  student_id       TEXT,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  program          TEXT NOT NULL,
  campus           TEXT NOT NULL,
  original_intake  TEXT NOT NULL,
  original_year    TEXT NOT NULL,
  deferred_intake  TEXT NOT NULL,
  deferred_year    TEXT NOT NULL,
  reason_category  TEXT NOT NULL,
  reason_details   TEXT NOT NULL,
  supporting_notes TEXT,
  signed_name      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes   TEXT DEFAULT '',
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deferment_status ON deferment_requests (status);
CREATE INDEX IF NOT EXISTS idx_deferment_submitted_at ON deferment_requests (submitted_at DESC);
