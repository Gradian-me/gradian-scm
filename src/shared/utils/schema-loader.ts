// Schema Loader Utility - SERVER SIDE ONLY
// Loads schemas from JSON file and converts them to FormSchema objects
// This file uses Node.js fs module and can only be imported in server components

import 'server-only';

import { FormSchema, FormField } from '../types/form-schema';
import fs from 'fs';
import path from 'path';

/**
 * Convert a pattern string to RegExp
 * @param pattern - The pattern string
 * @returns RegExp object or undefined
 */
function stringToRegExp(pattern: string | undefined): RegExp | undefined {
  if (!pattern) return undefined;
  
  try {
    return new RegExp(pattern);
  } catch (error) {
    console.warn(`Invalid pattern: ${pattern}`, error);
    return undefined;
  }
}

/**
 * Process a field to convert string patterns to RegExp
 * @param field - The field to process
 * @returns Processed field
 */
function processField(field: any): FormField {
  const processedField = { ...field };
  
  // Convert pattern string to RegExp
  if (processedField.validation?.pattern && typeof processedField.validation.pattern === 'string') {
    processedField.validation.pattern = stringToRegExp(processedField.validation.pattern);
  }
  
  return processedField;
}

/**
 * Process a schema to convert string patterns to RegExp objects
 * and transform old structure (fields in sections) to new structure (fields at schema level)
 * @param schema - The schema to process
 * @returns Processed schema
 */
function processSchema(schema: any): FormSchema {
  const processedSchema = { ...schema };
  
  // Ensure fields array exists
  if (!processedSchema.fields) {
    processedSchema.fields = [];
  }
  
  // If schema has old structure (fields in sections), transform to new structure
  if (processedSchema.sections && processedSchema.fields.length === 0) {
    const allFields: FormField[] = [];
    
    processedSchema.sections.forEach((section: any) => {
      if (section.fields && Array.isArray(section.fields)) {
        section.fields.forEach((field: any) => {
          allFields.push(processField({
            ...field,
            sectionId: section.id
          }));
        });
      }
      // Remove fields from section
      delete section.fields;
    });
    
    processedSchema.fields = allFields;
  } else if (processedSchema.fields && processedSchema.fields.length > 0) {
    // Process fields that are already at schema level
    processedSchema.fields = processedSchema.fields.map(processField);
  }
  
  // Ensure sections array exists
  if (!processedSchema.sections) {
    processedSchema.sections = [];
  }
  
  return processedSchema as FormSchema;
}

/**
 * Load all schemas from the JSON file
 * @returns Array of FormSchema objects
 */
export function loadAllSchemas(): FormSchema[] {
  try {
    // In production/build, use process.cwd()
    // In development, resolve from project root
    const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');
    
    // Check if file exists
    if (!fs.existsSync(dataPath)) {
      console.warn(`Schema file not found at: ${dataPath}`);
      return [];
    }
    
    // Read and parse the JSON file
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const schemas = JSON.parse(fileContents);
    
    if (!Array.isArray(schemas)) {
      console.error('Schemas file does not contain an array');
      return [];
    }
    
    // Process each schema to convert patterns
    const processedSchemas = schemas.map(processSchema);
    
    // Log loaded schemas for debugging (in both dev and production for dynamic schema tracking)
    console.log(`[Schema Loader] Loaded ${processedSchemas.length} schemas:`, processedSchemas.map(s => s.id));
    
    return processedSchemas;
  } catch (error) {
    console.error('Error loading schemas:', error);
    return [];
  }
}

/**
 * Load schemas and convert to a Map indexed by schema ID
 * @returns Map of schema ID to FormSchema
 */
export function loadSchemasAsMap(): Map<string, FormSchema> {
  const schemas = loadAllSchemas();
  const schemaMap = new Map<string, FormSchema>();
  
  schemas.forEach(schema => {
    schemaMap.set(schema.id, schema);
  });
  
  return schemaMap;
}

/**
 * Load schemas and convert to a Record indexed by schema ID
 * @returns Record of schema ID to FormSchema
 */
export function loadSchemasAsRecord(): Record<string, FormSchema> {
  const schemas = loadAllSchemas();
  const schemaRecord: Record<string, FormSchema> = {};
  
  schemas.forEach(schema => {
    schemaRecord[schema.id] = schema;
  });
  
  return schemaRecord;
}

/**
 * Get a single schema by ID
 * @param schemaId - The ID of the schema to get
 * @returns The schema or null if not found
 */
export function loadSchemaById(schemaId: string): FormSchema | null {
  const schemas = loadAllSchemas();
  return schemas.find(schema => schema.id === schemaId) || null;
}

