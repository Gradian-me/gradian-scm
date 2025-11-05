// Response Filter Utility
// Filters sensitive fields (like passwords) from API responses

/**
 * Get schema for a given schema ID
 */
async function getSchema(schemaId: string): Promise<any> {
  try {
    const { getSchemaById } = await import('@/gradian-ui/schema-manager/utils/schema-registry.server');
    return await getSchemaById(schemaId);
  } catch (error) {
    console.warn(`[RESPONSE_FILTER] Could not load schema for ${schemaId}:`, error);
    return null;
  }
}

/**
 * Filter out password fields from entity data
 * Removes fields with role="password" from the schema
 * @param schemaId - The schema ID (e.g., "users")
 * @param data - The entity data to filter
 * @returns Filtered data without password fields
 */
export async function filterPasswordFields<T>(
  schemaId: string,
  data: T
): Promise<T> {
  // Get the schema to find password fields
  const schema = await getSchema(schemaId);
  if (!schema || !schema.fields) {
    return data;
  }

  // Find fields with role="password"
  const passwordFields = schema.fields.filter(
    (field: any) => field.role === 'password'
  );

  if (passwordFields.length === 0) {
    return data;
  }

  // Get field names to exclude
  const passwordFieldNames = passwordFields.map((field: any) => field.name);

  // Filter out password fields from data
  if (Array.isArray(data)) {
    return data.map((item) => {
      const filtered = { ...item };
      passwordFieldNames.forEach((fieldName) => {
        delete filtered[fieldName as keyof typeof filtered];
      });
      return filtered;
    }) as T;
  } else if (data && typeof data === 'object') {
    const filtered = { ...data };
    passwordFieldNames.forEach((fieldName) => {
      delete filtered[fieldName as keyof typeof filtered];
    });
    return filtered as T;
  }

  return data;
}

