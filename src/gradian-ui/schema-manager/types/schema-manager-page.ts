import { FormSchema } from './form-schema';

export type SchemaTab = 'system' | 'business';

export interface DeleteDialogState {
  open: boolean;
  schema: FormSchema | null;
}

export interface CreateSchemaPayload {
  singularName: string;
  pluralName: string;
  schemaId: string;
  description: string;
  showInNavigation: boolean;
  isSystemSchema: boolean;
}

export interface SchemaCreateResult {
  success: boolean;
  error?: string;
}
