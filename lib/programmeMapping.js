function normalizeProgramme(raw) {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")                 // drop parenthetical notes
    .replace(/&/g, "and")
    .replace(/[-–]?\s*trans(fer)?\.?\s*$/g, "") // drop trailing "trans"/"transfer"/"-trans"
    .replace(/[^\w\s]/g, " ")                 // strip remaining punctuation (/, commas, etc.)
    .replace(/\s+/g, " ")
    .trim();
}

// Only entries we're confident map cleanly to one of the apply form's
// dropdown options. Anything not listed here is left for the student
// to select manually, rather than risk assigning the wrong programme.
const PROGRAMME_MAP = {
  "certificate in healthcare support assistant": "Certificate in Healthcare Support",
  "certificate in healthcare support sevices": "Certificate in Healthcare Support",
  "certificate in health support assistant": "Certificate in Healthcare Support",
  "certificate in healthcare support assistant upgrading to hss level 5": "Certificate in Healthcare Support",
  "certificate in community development and social work": "Certificate in Social Work and Community Development",
  "certificate in social work": "Certificate in Social Work and Community Development",
  "certificate in community health": "Certificate in Community Health",
  "certificate in community health and development": "Certificate in Community Health",
  "certificate in community health development": "Certificate in Community Health",
  "certificate in counselling psychology": "Certificate in Counselling Psychology",
  "certificate food science and processing technology": "Certificate in Food Technology",
  "care giver": "Caregiving Level 4",
  "diploma in perioperative theatre technology": "Diploma in Perioperative Theatre Technology",
  "certificate in science laboratory technology": "Certificate in Science Laboratory Technology",
  "diploma in biomedical engineering technology": "Diploma in Biomedical Engineering Technology",
  "diploma in community development and social work": "Diploma in Social Work and Community Development",
  "diploma in social work and community health": "Diploma in Social Work and Community Development",
  "diploma in community health": "Diploma in Community Health",
  "diploma in community health assistant": "Diploma in Community Health",
  "diploma in community health assistance": "Diploma in Community Health",
  "diploma in community health and development": "Diploma in Community Health",
  "diploma in community health and hivaids management": "Diploma in Community Health",
  "diploma in clinical medicine and surgery": "Diploma in Clinical Medicine and Surgery",
  "diploma in counselling psychology": "Diploma in Counseling Psychology",
  "diploma in human nutrition and dietetics": "Diploma in Human Nutrition and Dietetics",
  "diploma in health records and information technology": "Diploma in Health Records and Information Technology",
  "diploma in health records and it": "Diploma in Health Records and Information Technology",
  "diploma in information technology": "Diploma in Information Technology",
  "diploma in nutrition and dietetic": "Diploma in Human Nutrition and Dietetics",
  "diploma in kenya registered community health nursing": "Diploma in Kenya Registered Community Health Nursing",
  "diploma in physiotheraphy": "Diploma in Physiotherapy",
};

// Returns the exact dropdown option text, or null if there's no
// confident match (caller should leave the field blank/editable).
export function mapProgrammeName(rawFromSheet) {
  const key = normalizeProgramme(rawFromSheet);
  return PROGRAMME_MAP[key] || null;
}