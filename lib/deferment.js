// Deferment policy logic shared between the client form and the server API,
// so both agree on what's a valid semester/year combo and when the window closes.

export const SEMESTERS = [
  { value: "Jan-Apr", label: "January - April", idx: 0, startMonthLabel: "January", firstMonth: 0, firstMonthLastDay: 31 },
  { value: "May-Aug", label: "May - August", idx: 1, startMonthLabel: "May", firstMonth: 4, firstMonthLastDay: 31 },
  { value: "Sep-Dec", label: "September - December", idx: 2, startMonthLabel: "September", firstMonth: 8, firstMonthLastDay: 30 }
];

export function getCurrentSemesterIndex(date) {
  const m = date.getMonth(); // 0-11
  if (m <= 3) return 0; // Jan(0)-Apr(3)
  if (m <= 7) return 1; // May(4)-Aug(7)
  return 2; // Sep(8)-Dec(11)
}

// The window to submit a deferment request for the CURRENT ongoing semester
// closes at the end of that semester's first month.
export function getSubmissionDeadline(now) {
  const idx = getCurrentSemesterIndex(now);
  const year = now.getFullYear();
  const s = SEMESTERS[idx];
  return new Date(year, s.firstMonth, s.firstMonthLastDay, 23, 59, 59);
}

export function getAllowedYears(now) {
  const y = now.getFullYear();
  return [y, y + 1];
}

// Which semesters can be selected for a given target year: the currently
// ongoing semester (if its own deadline hasn't passed) or any later one.
// A future year has no such restriction — students can always defer ahead.
export function getAllowedSemesters(selectedYear, now) {
  const currentYear = now.getFullYear();
  const currentIdx = getCurrentSemesterIndex(now);
  const deadline = getSubmissionDeadline(now);
  const currentDeadlinePassed = now.getTime() > deadline.getTime();
  const minIdx = currentDeadlinePassed ? currentIdx + 1 : currentIdx;

  if (Number(selectedYear) === currentYear) {
    return SEMESTERS.filter((s) => s.idx >= minIdx);
  }
  return SEMESTERS;
}

// Deferment is limited to a single semester (~3 months): resumption is the
// start of the very next semester after the one being deferred.
export function getResumptionDate(semesterValue, year) {
  const s = SEMESTERS.find((x) => x.value === semesterValue);
  if (!s || !year) return null;
  const nextIdx = (s.idx + 1) % 3;
  const nextSemester = SEMESTERS[nextIdx];
  const resumeYear = s.idx === 2 ? Number(year) + 1 : Number(year);
  return `${nextSemester.startMonthLabel} ${resumeYear}`;
}

export function formatDeadline(date) {
  return date.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) +
    " at " +
    date.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" });
}

export function isCurrentSemesterDeadlinePassed(now) {
  const deadline = getSubmissionDeadline(now);
  return now.getTime() > deadline.getTime();
}

export function isSemesterYearAllowed(semesterValue, year, now) {
  const allowedYears = getAllowedYears(now);
  if (!allowedYears.includes(Number(year))) return false;
  const allowed = getAllowedSemesters(year, now);
  return allowed.some((s) => s.value === semesterValue);
}
