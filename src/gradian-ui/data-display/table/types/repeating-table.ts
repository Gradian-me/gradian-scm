import { FormSchema, RepeatingTableRendererConfig } from '@/gradian-ui/schema-manager/types/form-schema';

export interface ColumnWidthConfig {
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

export type ColumnWidthMap = Record<string, ColumnWidthConfig>;

export type RelationDirection = 'source' | 'target';

export interface RelationInfo {
  directions: Set<RelationDirection>;
  relationTypeTexts: string[];
}

export interface UseRepeatingTableDataParams {
  config: RepeatingTableRendererConfig;
  schema: FormSchema;
  data: any;
  sourceSchemaId?: string;
  sourceId?: string;
  initialTargetSchema?: FormSchema | null;
}

export interface UseRepeatingTableDataResult<T = any> {
  isRelationBased: boolean;
  sectionData: T[];
  section: FormSchema['sections'][number] | undefined;
  fieldsToDisplay: any[];
  targetSchemaData: FormSchema | null;
  isLoadingRelations: boolean;
  isLoadingTargetSchema: boolean;
  relationInfo: RelationInfo;
  refresh: () => Promise<void>;
}


