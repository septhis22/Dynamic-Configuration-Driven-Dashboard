import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../lib/db'; 

const WorkspaceParamSchema = z.object({
  workspace_id: z.string().uuid("Invalid workspace ID format. Must be a valid UUID.")
});

const UpdateStageSchema = z.object({
  current_stage: z.string().min(1, "Stage cannot be empty")
});

export const updateWorkspaceStage = async (req: Request, res: Response) => {
  try {
    const { workspace_id } = WorkspaceParamSchema.parse(req.params);
    const { current_stage } = UpdateStageSchema.parse(req.body);

    const configCheckQuery = `
      SELECT status_options 
      FROM workspace_configs 
      WHERE workspace_id = $1;
    `;
    const configResult = await pool.query(configCheckQuery, [workspace_id]);

    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: "Configuration not found." });
    }

    const validOptions: string[] = configResult.rows[0].status_options;

    if (!validOptions.includes(current_stage)) {
      return res.status(400).json({ 
        error: "Invalid stage value",
        message: `Stage must be one of: ${validOptions.join(', ')}`
      });
    }

    const updateQuery = `
      UPDATE workspace_configs
      SET current_stage = $1
      WHERE workspace_id = $2
      RETURNING *;
    `;

    const updateResult = await pool.query(updateQuery, [current_stage, workspace_id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Record not found during update." });
    }

    return res.status(200).json({
      success: true,
      message: "Stage updated successfully.",
      configuration: updateResult.rows[0]
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Failed",
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error("Error updating stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};