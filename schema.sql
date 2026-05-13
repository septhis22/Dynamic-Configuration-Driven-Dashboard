-- ============================================================================
-- 1. WORKSPACES TABLE
-- Stores the identity of the client/company.
-- ============================================================================
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Unique constraint ensures no duplicate workspace names
    workspace_name VARCHAR(255) NOT NULL UNIQUE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. WORKSPACE CONFIGS TABLE
-- Stores the dynamic terminology and available stages.
-- Each workspace has exactly one configuration (One-to-One relationship).
-- ============================================================================
CREATE TABLE workspace_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links to workspaces; UNIQUE + REFERENCES enforces the 1:1 relationship
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    
    primary_label VARCHAR(50) NOT NULL, -- e.g., "Campaign", "Case", "Listing"
    status_label VARCHAR(50) NOT NULL,  -- e.g., "Stage", "Status", "Phase"
    
    -- JSONB stores the array of possible stages for the dropdown
    status_options JSONB NOT NULL,      -- e.g., ["Draft", "Live", "Archived"]
    
    -- Tracks the global current stage of the project if only one is allowed
    current_stage TEXT, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

