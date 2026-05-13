# Dynamic Configuration-Driven Dashboard

A full-stack application that dynamically generates its dashboard UI based on configuration data stored in a database. It supports creating multiple workspaces, each with its own customized labels and state tracking.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Backend**: Node.js, Express, TypeScript, Zod (for payload validation)
*   **Database**: Supabase (PostgreSQL) using the `pg` pool library.

---

## API Routes

The Express backend exposes the following RESTful routes:

### `GET /api/workspaces`
Fetches a list of all available workspaces (returns just the `id` and `workspace_name`). Used to populate the frontend selection dropdown.

### `GET /api/dashboard-config/:workspace_id`
Retrieves the specific configuration details for a given workspace. Returns data like the `primary_label`, `status_label`, `status_options`, and the `current_stage`.

### `POST /api/admin/workspace-config`
Accepts a JSON payload to rapidly scaffold and create a brand new workspace alongside its custom configuration settings. This is utilized by the dashboard's internal Config Creator module, but can also be directly interacted with via simple raw API calls by sending a valid JSON payload from any client or script.

### `PUT /api/dashboard-config/:workspace_id/status`
Updates the `current_stage` of a specific workspace configuration. It ensures that the incoming stage matches one of the valid `status_options` previously defined.

---

## React Dashboard

The frontend serves as a dynamic portal to interact with your configured workspaces:
*   **Workspace Selector**: A top dropdown menu instantly toggles between available workspaces. Upon selection, it fetches that workspace's config and seamlessly re-renders the dashboard terminology.
*   **Dynamic Labels**: Uses dynamic data mapped from the backend, allowing terminologies like "Campaign" vs. "Case" or "Status" vs. "Stage" to interchange safely based on the active workspace.
*   **Interactive Status Updating**: Allows users to select next steps from the customized `status_options` dropdown and update the workspace's state in real-time.
*   **Config Creator**: Features an "Add New Config" button that spawns a modal. Here, users can post raw valid JSON directly into the system to spawn an active new workspace instantly.



