import { FormConfig } from '../../../gradian-ui/form-builder/form-wrapper/types';
import { FormSection } from '../../../gradian-ui/form-builder/types/form-schema';

// Card section for simplified card metadata
export interface CardSection {
  id: string;
  title: string;
  colSpan?: number;
  fieldIds: string[];
}

export interface ExtendedFormSchema extends Omit<FormConfig, 'fields'> {
  singular_name?: string;
  plural_name?: string;
  cardMetadata?: CardSection[];
  sections?: FormSection[];
}
