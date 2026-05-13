import express from "express";
import { fetchConfig } from "./services/fetchConfig";
import { createWorkspaceConfig } from "./services/uploadConfig";
import { fetchAllIds } from "./services/fetchAllIds";
import { updateWorkspaceStage } from "./services/updateConfig";

const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post("/api/admin/workspace-config", createWorkspaceConfig);

app.get("/api/workspaces", async (req, res) => {
    try {
        const data = await fetchAllIds();
        res.json(data);
    } catch (error: any) {
        if (error.name === "NotFoundError") {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

app.get("/api/dashboard-config/:workspace_id", async (req, res) => {
    try {
        const data = await fetchConfig(req.params.workspace_id);
        res.json(data);
    } catch (error: any) {
        if (["ValidationError", "NotFoundError", "DataIntegrityError"].includes(error.name)) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

app.put("/api/dashboard-config/:workspace_id/status", updateWorkspaceStage);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});