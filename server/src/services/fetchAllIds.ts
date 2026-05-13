import pool from "../lib/db";

export const fetchAllIds = async () => {
  try {
    const query = `SELECT id, workspace_name FROM workspaces ORDER BY created_at DESC;`;
    const result = await pool.query(query);
    
    if (result.rowCount === 0) {
      const error = new Error("No workspaces found.");
      error.name = "NotFoundError";
      throw error;
    }

    return result.rows;

  } catch (error: any) {
    if (error.name === "NotFoundError") {
      throw error;
    }
    console.error("[DB Error] Fetching all workspace IDs:", error.message);
    const dbError = new Error("An internal database error occurred.");
    dbError.name = "DatabaseError";
    throw dbError;
  }
};
