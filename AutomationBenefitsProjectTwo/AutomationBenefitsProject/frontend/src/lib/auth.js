// src/lib/auth.js
const KEY = "abp_session"; // Automation Benefits Project session

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSession(s) {
  localStorage.setItem(KEY, JSON.stringify(s || {}));
}

export function getToken() {
  return readSession().token || null;
}

export function getUser() {
  const s = readSession();
  return s.user || null; // { name, email, role }
}

export function isAdmin() {
  return getUser()?.role === "Admin";
}

export function logout() {
  writeSession({});
}

/**
 * Perform login against the backend API.
 * Stores { token, user } in localStorage on success.
 */
export async function login(email, password) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg || "Login failed");
  }

  const data = await res.json(); // { token, name, email, role }
  writeSession({
    token: data.token,
    user: { name: data.name, email: data.email, role: data.role }
  });

  return getUser();
}

async function safeError(res) {
  try {
    const j = await res.json();
    return j?.message || j?.title || res.statusText;
  } catch {
    return res.statusText;
  }
}
