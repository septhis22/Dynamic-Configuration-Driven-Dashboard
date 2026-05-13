import { useState, useEffect } from "react";
import "./Dashboard.css";

export interface WorkspaceConfig {
  primary_label: string;
  status_label: string;
  status_options: string[];
  current_stage?: string;
}

export interface Workspace {
  workspace_id: string;
  workspace_name: string;
  configuration: WorkspaceConfig;
}

export interface BasicWorkspace {
  id: string;
  workspace_name: string;
}

export default function Dashboard() {
  const [availableWorkspaces, setAvailableWorkspaces] = useState<BasicWorkspace[]>([]);
  const [activeWsId, setActiveWsId] = useState<string>("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingStage, setUpdatingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      const data: BasicWorkspace[] = await res.json();
      setAvailableWorkspaces(data);
      if (data.length > 0 && !activeWsId) {
        setActiveWsId(data[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching workspaces:", err);
      setError("Could not load available workspaces.");
    }
  };

  // Fetch all workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Fetch config whenever the active workspace ID changes
  useEffect(() => {
    if (!activeWsId) return;

    const fetchConfig = async () => {
      setLoading(true);
      setError("");
      setWorkspace(null); // Clear previous data
      try {
        const res = await fetch(`http://localhost:3000/api/dashboard-config/${activeWsId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch configuration");
        }
        const data = await res.json();
        setWorkspace(data);
        if (data.configuration.current_stage) {
          setSelectedStage(data.configuration.current_stage);
        } else if (data.configuration.status_options.length > 0) {
          setSelectedStage(data.configuration.status_options[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [activeWsId]);

  const handleCreateConfig = async () => {
    try {
      setCreateLoading(true);
      let payload;
      try {
        payload = JSON.parse(jsonInput);
      } catch (err: any) {
        throw new Error("Invalid JSON format");
      }

      const res = await fetch("http://localhost:3000/api/admin/workspace-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Creation failed");
      }

      setShowCreateModal(false);
      setJsonInput("");
      fetchWorkspaces();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStage = async () => {
    if (!workspace || !selectedStage) return;
    setUpdatingStage(true);
    try {
      const res = await fetch(`http://localhost:3000/api/dashboard-config/${workspace.workspace_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_stage: selectedStage })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update stage");
      }

      setWorkspace({
        ...workspace,
        configuration: {
          ...workspace.configuration,
          current_stage: selectedStage
        }
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStage(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <div className="header-title">Configr Dashboard</div>
          
          <select 
            value={activeWsId}
            onChange={(e) => setActiveWsId(e.target.value)}
            className="input header-select"
            disabled={loading || availableWorkspaces.length === 0}
          >
            {availableWorkspaces.length === 0 && <option value="">No Workspaces Available</option>}
            {availableWorkspaces.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.workspace_name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Add New Config
        </button>
      </header>

      <main className="main">
        {error && <div className="error-text">{error}</div>}
        
        {loading && <div style={{ marginBottom: "20px" }}>Loading configuration...</div>}

        {!loading && workspace && (
          <div className="card">
            <h1 style={{ margin: 0, fontSize: "1.5rem", marginBottom: "10px" }}>
              {workspace.workspace_name}
            </h1>
            <div className="card-inner">
              <p style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
                {workspace.configuration.primary_label}
              </p>
              
              <p style={{ marginBottom: "15px" }}>
                Current {workspace.configuration.status_label}: <strong>{workspace.configuration.current_stage || "Not set"}</strong>
              </p>
              
              <p>
                Possible {workspace.configuration.status_label}s: {workspace.configuration.status_options.join(", ")}
              </p>
              
              <div className="update-status-row">
                <select
                  className="input"
                  style={{ marginTop: 0, marginBottom: 0, width: "auto" }}
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  disabled={updatingStage}
                >
                  {workspace.configuration.status_options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn-primary"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={handleUpdateStage}
                  disabled={updatingStage || selectedStage === workspace.configuration.current_stage}
                >
                  {updatingStage ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Configuration</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <textarea 
                className="input textarea-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'{\n  "workspace_name": "Acme Corp",\n  "primary_label": "Campaign",\n  "status_label": "Status",\n  "status_options": ["Draft", "Active", "Closed"]\n}'}
              />
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateConfig} disabled={createLoading}>
                {createLoading ? "Creating..." : "Submit JSON"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}