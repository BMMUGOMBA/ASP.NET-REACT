// src/lib/validate.js
// simple, dependency-free validation helpers for the local-storage app

const isNil = (v) => v === undefined || v === null;
const isBlank = (v) => isNil(v) || String(v).trim() === '';
const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

const addErr = (errors, key, msg) => {
  if (!errors[key]) errors[key] = [];
  errors[key].push(msg);
};

export function validateLogin({ email, password }) {
  const errors = {};
  if (isBlank(email)) addErr(errors, 'email', 'Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(email)) addErr(errors, 'email', 'Invalid email');
  if (isBlank(password)) addErr(errors, 'password', 'Password is required');
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate the project payload used by ProjectEditor.jsx
 * Shape expected (local-storage front end):
 * {
 *  processName, businessUnit,
 *  rolesImpacted: string[], systemsImpacted: string[],
 *  percentAutomated, staffImpacted, breadth, cycleTimeMinutes, complexitySystems, manHoursPerMonth,
 *  howOftenText,
 *  brd: { file?, objective?, scope?, assumptions?, acceptanceCriteria? }
 * }
 */
export function validateProject(payload) {
  const p = payload || {};
  const errors = {};

  // required strings
  if (isBlank(p.processName)) addErr(errors, 'processName', 'Required');
  else if (p.processName.length > 200) addErr(errors, 'processName', 'Max 200 chars');

  if (isBlank(p.businessUnit)) addErr(errors, 'businessUnit', 'Required');
  else if (p.businessUnit.length > 50) addErr(errors, 'businessUnit', 'Max 50 chars');

  if (isBlank(p.howOftenText)) addErr(errors, 'howOftenText', 'Please describe how often the process runs');
  else if (p.howOftenText.length > 2000) addErr(errors, 'howOftenText', 'Max 2000 chars');

  // numbers
  checkNumRange(errors, 'percentAutomated', p.percentAutomated, 0, 100, '0..100');
  ['staffImpacted', 'breadth', 'cycleTimeMinutes', 'complexitySystems'].forEach(k =>
    checkNumRange(errors, k, p[k], 0, Number.POSITIVE_INFINITY, '≥ 0')
  );
  checkNumRange(errors, 'manHoursPerMonth', p.manHoursPerMonth, 0, Number.POSITIVE_INFINITY, '≥ 0');

  // arrays (roles/systems)
  if (!Array.isArray(p.rolesImpacted)) addErr(errors, 'rolesImpacted', 'Must be a list');
  else if (p.rolesImpacted.some(r => isBlank(r))) addErr(errors, 'rolesImpacted', 'No empty items');
  else if (p.rolesImpacted.some(r => r.length > 120)) addErr(errors, 'rolesImpacted', 'Each role ≤ 120 chars');

  if (!Array.isArray(p.systemsImpacted)) addErr(errors, 'systemsImpacted', 'Must be a list');
  else if (p.systemsImpacted.some(s => isBlank(s))) addErr(errors, 'systemsImpacted', 'No empty items');
  else if (p.systemsImpacted.some(s => s.length > 120)) addErr(errors, 'systemsImpacted', 'Each system ≤ 120 chars');

  // BRD section (optional content)
  const brd = p.brd || {};
  [['objective','BRD Objective'], ['scope','BRD Scope'], ['assumptions','Key Assumptions'], ['acceptanceCriteria','Acceptance Criteria']]
    .forEach(([key,label]) => {
      const v = brd[key];
      if (!isBlank(v) && String(v).length > 1000) addErr(errors, `brd.${key}`, `${label} max 1000 chars`);
    });

  // BRD file (optional)
  if (brd.file) {
    const f = brd.file;
    const maxMB = 10;
    const okTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!okTypes.includes(f.type)) addErr(errors, 'brd.file', 'File must be PDF/DOC/DOCX/TXT');
    if (f.size > maxMB * 1024 * 1024) addErr(errors, 'brd.file', `File must be ≤ ${maxMB} MB`);
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function checkNumRange(errors, key, value, min, max, label) {
  if (!isNum(value)) addErr(errors, key, 'Must be a number');
  else {
    if (value < min) addErr(errors, key, `Must be ${label}`);
    if (Number.isFinite(max) && value > max) addErr(errors, key, `Must be ${label}`);
  }
}

// small helpers for UIs
export const hasError = (errors, key) => !!errors && !!errors[key];
export const firstError = (errors, key) => hasError(errors, key) ? errors[key][0] : '';
