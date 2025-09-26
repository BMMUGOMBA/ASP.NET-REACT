// src/lib/api.js
// Tiny fetch wrapper used by all services.
// Responsibilities:
// - prepend base URL from VITE_API_URL
// - attach Authorization: Bearer <token> if present
// - handle JSON parsing and errors consistently
// - support JSON bodies or FormData uploads

import { getToken, logout } from "./auth";

const BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:5214/api

/**
 * Call the backend API.
 *
 * @param {string} path - Path starting with "/", e.g. "/projects/mine"
 * @param {object} [opts]
 * @param {string} [opts.method="GET"]
 * @param {object} [opts.headers]
 * @param {any}    [opts.body]     - JSON body (object will be stringified)
 * @param {FormData} [opts.formData] - Use for file uploads; don't set Content-Type yourself
 * @returns {Promise<any>} Parsed JSON (or null for empty responses)
 */
export async function api(path, { method = "GET", headers, body, formData } = {}) {
  if (!BASE) {
    throw new Error("VITE_API_URL is not set. Create frontend/.env with VITE_API_URL=http://localhost:5214/api");
  }

  const token = getToken();
  const url = `${BASE}${path}`;

  const opts = { method, headers: { ...(headers || {}) } };

  if (formData) {
    // Let the browser set multipart boundaries automatically
    opts.body = formData;
  } else if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  if (token) {
    opts.headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, opts);

  // Optional global 401 handling
  if (res.status === 401) {
    logout(); // clear any stale session
    // You can also redirect here if you prefer, but throwing keeps it generic.
    throw new Error("Unauthorized. Please log in again.");
  }

  // Try to parse JSON even for non-2xx to surface server error messages
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response; keep as null
  }

 /* if (!res.ok) {
    const msg = (data && (data.message || data.title)) || res.statusText || "Request failed";
    throw new Error(msg);
  }*/
 // inside api.js, after parsing JSON `data` and before `throw new Error(msg)`
if (!res.ok) {
  let msg = (data && (data.message || data.title)) || res.statusText || "Request failed";
  if (data && data.errors && typeof data.errors === "object") {
    const details = Object.entries(data.errors)
      .map(([k, arr]) => `${k}: ${Array.isArray(arr) ? arr[0] : arr}`)
      .join("; ");
    if (details) msg = `${msg} — ${details}`;
  }
  throw new Error(msg);
}


  return data;
}

// Optional default export so either import style works
export default api;
