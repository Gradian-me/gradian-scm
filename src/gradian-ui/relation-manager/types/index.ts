// Relation Manager Types

export interface RelationType {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface RelationManagerConfig {
  apiBaseUrl?: string;
  onSave?: (relationType: RelationType) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export interface RelationManagerState {
  relationType: RelationType | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface RelationManagerActions {
  loadRelationType: (id: string) => Promise<void>;
  saveRelationType: (relationType: RelationType) => Promise<void>;
  deleteRelationType: (id: string) => Promise<void>;
  setRelationType: (relationType: RelationType) => void;
  updateRelationType: (updates: Partial<RelationType>) => void;
  reset: () => void;
}

export interface UseRelationManagerReturn {
  state: RelationManagerState;
  actions: RelationManagerActions;
}

