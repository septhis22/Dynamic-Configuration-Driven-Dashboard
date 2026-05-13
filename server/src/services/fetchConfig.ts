import pool from "../lib/db";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export const fetchConfig = async (workspaceId: string) => {
  // 1. Input Validation: Prevent Postgres from throwing syntax errors
  const validation = uuidSchema.safeParse(workspaceId);
  if (!validation.success) {
    const error = new Error("Invalid workspace ID format.");
    error.name = "ValidationError";
    throw error;
  }

  try {
    const workspaceQuery = `SELECT id, workspace_name FROM workspaces WHERE id = $1;`;
    const configQuery = `
      SELECT primary_label, status_label, status_options, current_stage 
      FROM workspace_configs 
      WHERE workspace_id = $1;
    `;
    const [workspaceResult, configResult] = await Promise.all([
      pool.query(workspaceQuery, [workspaceId]),
      pool.query(configQuery, [workspaceId])
    ]);

    const workspace = workspaceResult.rows[0];
    
    // 2. Not Found Handling
    if (!workspace) {
      const error = new Error("Workspace not found.");
      error.name = "NotFoundError";
      throw error;
    }

    const config = configResult.rows[0];

    // 3. Data Integrity Check: A workspace without a config breaks the app
    if (!config) {
      const error = new Error("Workspace configuration is missing or corrupted.");
      error.name = "DataIntegrityError";
      throw error;
    }

    return {
      workspace_id: workspace.id,
      workspace_name: workspace.workspace_name,
      configuration: {
        primary_label: config.primary_label,
        status_label: config.status_label,
        status_options: config.status_options,
        current_stage: config.current_stage
      }
    };

  } catch (error: any) {
    // 4. Re-throw our custom handled errors so the Express route can read them
    if (["ValidationError", "NotFoundError", "DataIntegrityError"].includes(error.name)) {
      throw error; 
    }

    // 5. Catch actual database connection/syntax errors
    console.error(`[DB Connection Error] Fetching workspace ${workspaceId}:`, error.message);
    const dbError = new Error("An internal database error occurred.");
    dbError.name = "DatabaseError";
    throw dbError;
  }
};