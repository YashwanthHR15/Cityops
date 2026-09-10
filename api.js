/* ============================================================
   Karnataka Sarkara · BBMP Citizen Portal
   api.js — single place to point at Member B's backend.

   Update API_BASE once B/D give you the deployed URL
   (per the Phase 1 plan, that should land by hour ~2-4).
   Everything else in index.html / complaint.html calls the
   helpers below instead of hardcoding fetch() calls.
   ============================================================ */

const API_BASE = "https://cityops-1.onrender.com"; // e.g. https://api.bbmp-seva.app

/**
 * Generic JSON fetch wrapper with a timeout, so a slow/dead
 * backend never leaves the UI hanging silently.
 */
async function apiGet(path, { timeoutMs = 7000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function apiPost(path, body, { timeoutMs = 15000, isFormData = false } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body: isFormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`POST ${path} failed: ${res.status} ${msg}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/* ---------------------------------------------------------
   SiteContent — GET /site-content
   Expected shape (confirm exact field names with Member B):
   { banner: "...", tagline: "...", description: "..." }
   A hardcoded fallback is used ONLY if the API is unreachable,
   so the page still renders during early dev — the real
   content always comes from the API once B's endpoint is live.
--------------------------------------------------------- */
const SITE_CONTENT_FALLBACK = {
  banner: "Karnataka Sarkara · BBMP",
  tagline: "Report civic issues. Track them to resolution.",
  description:
    "Register a complaint about roads, garbage, water supply, streetlights or drainage in your ward. Every complaint gets a tracking ID, is routed to the right department, and you can follow its status here — no login required.",
};

async function fetchSiteContent() {
  try {
    const data = await apiGet("/site-content");
    return { ...SITE_CONTENT_FALLBACK, ...data };
  } catch (err) {
    console.warn("SiteContent API unavailable, using fallback copy:", err.message);
    return SITE_CONTENT_FALLBACK;
  }
}

/* ---------------------------------------------------------
   Categories — GET /categories
   Expected shape: [{ id, name }, ...]
   Fallback list only covers local dev before B's endpoint exists.
--------------------------------------------------------- */
const CATEGORIES_FALLBACK = [
  { id: "roads", name: "Roads & Potholes" },
  { id: "garbage", name: "Garbage & Waste" },
  { id: "water", name: "Water Supply" },
  { id: "streetlight", name: "Streetlight" },
  { id: "drainage", name: "Drainage / Sewage" },
  { id: "other", name: "Other" },
];

async function fetchCategories() {
  try {
    const data = await apiGet("/categories");
    if (Array.isArray(data) && data.length) return data;
    return CATEGORIES_FALLBACK;
  } catch (err) {
    console.warn("Categories API unavailable, using fallback list:", err.message);
    return CATEGORIES_FALLBACK;
  }
}

/* ---------------------------------------------------------
   Submit complaint — POST /complaints
   Sends multipart/form-data because a photo file is attached.
   Confirm exact field names with Member B; this matches the
   spec: name, mobile, category, photo, lat, lng, address_line,
   landmark, citizen_id (server infers from auth token if logged in).
--------------------------------------------------------- */
async function submitComplaint({
  name,
  mobile,
  categoryId,
  photoFile,
  lat,
  lng,
  addressLine,
  landmark,
}) {
  const fd = new FormData();
  if (name) fd.append("name", name);
  if (mobile) fd.append("mobile", mobile);
  fd.append("category", categoryId);
  if (photoFile) fd.append("photo", photoFile);
  if (lat != null) fd.append("lat", lat);
  if (lng != null) fd.append("lng", lng);
  fd.append("address_line", addressLine);
  fd.append("landmark", landmark || "");

  const authToken = localStorage.getItem("bbmp_auth_token");
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers,
      body: fd,
      signal: controller.signal,
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`Submit failed: ${res.status} ${msg}`);
    }
    return await res.json(); // expected: { tracking_id: "BBMP-XXXXX", ... }
  } finally {
    clearTimeout(t);
  }
}
