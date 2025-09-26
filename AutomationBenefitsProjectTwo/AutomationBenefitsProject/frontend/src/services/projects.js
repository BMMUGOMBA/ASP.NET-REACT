// src/services/project.js
// Centralized API calls for the Projects feature.
// Relies on the fetch wrapper in src/lib/api.js (adds base URL + Authorization).

import { api } from "../lib/api";

/**
 * Shape of the "create project" payload your API expects.
 * Only include primitive/array fields here — BRD file is uploaded separately.
 *
 * @typedef {Object} CreateProjectPayload
 * @property {string} processName
 * @property {string} businessUnit
 * @property {string[]} rolesImpacted
 * @property {string[]} systemsImpacted
 * @property {number} percentAutomated
 * @property {number} staffImpacted
 * @property {number} breadth
 * @property {number} cycleTimeMinutes
 * @property {number} complexitySystems
 * @property {number} manHoursPerMonth
 * @property {string} howOftenText
 * @property {"Small"|"Medium"|"Large"} sizeRating
 * @property {Object} benefits
 * @property {{objective?:string,scope?:string,assumptions?:string,acceptanceCriteria?:string}} brd
 */

export const projects = {
  /**
   * Get projects for the current signed-in user.
   * GET /api/projects/mine
   */
  listMine() {
    return api("/projects/mine");
  },

  /**
   * Get a single project by id.
   * GET /api/projects/{id}
   * @param {string|number} id
   */
  getById(id) {
    return api(`/projects/${id}`);
  },

  /**
   * Create a new project (without the BRD file).
   * POST /api/projects
   * @param {CreateProjectPayload} payload
   */
  create(payload) {
    return api("/projects", { method: "POST", body: payload });
  },

  /**
   * Upload a BRD file for a project (multipart/form-data).
   * POST /api/projects/{id}/brd
   * The backend expects the field name to be "file".
   * @param {string|number} projectId
   * @param {File} file - Raw File object from an <input type="file" />
   */
  uploadBrd(projectId, file) {
    const fd = new FormData();
    fd.append("file", file);
    return api(`/projects/${projectId}/brd`, { method: "POST", formData: fd });
  },

  // -------- Admin-only endpoints --------

  /**
   * List all projects (admin view).
   * GET /api/admin/projects
   */
  adminList() {
    return api("/admin/projects");
  },

  /**
   * Approve a project.
   * POST /api/admin/projects/{id}/approve
   * @param {string|number} id
   * @param {string} [comment]
   */
  approve(id, comment) {
    return api(`/admin/projects/${id}/approve`, {
      method: "POST",
      body: comment ? { comment } : {}
    });
  },

  /**
   * Request changes from the requester.
   * POST /api/admin/projects/{id}/request-changes
   * @param {string|number} id
   * @param {string} comment
   */
  requestChanges(id, comment) {
    return api(`/admin/projects/${id}/request-changes`, {
      method: "POST",
      body: { comment: comment || "" }
    });
  }
};

// Optional: allow both import styles
export default projects;
export { projects as projectService };
