import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';

interface SchemaCacheEntry {
  schema: FormSchema;
  timestamp: number;
}

interface SchemaState {
  // Cache for schemas by ID
  schemaCache: Map<string, SchemaCacheEntry>;
  
  // Get schema from cache
  getSchema: (schemaId: string) => FormSchema | null;
  
  // Set schema in cache
  setSchema: (schemaId: string, schema: FormSchema) => void;
  
  // Clear specific schema from cache
  clearSchema: (schemaId: string) => void;
  
  // Clear all schemas from cache
  clearAllSchemas: () => void;
  
  // Check if schema is cached
  hasSchema: (schemaId: string) => boolean;
  
  // Get cache age in milliseconds
  getCacheAge: (schemaId: string) => number | null;
}

export const useSchemaStore = create<SchemaState>()(
  devtools(
    (set, get) => ({
      schemaCache: new Map(),
      
      getSchema: (schemaId: string) => {
        const entry = get().schemaCache.get(schemaId);
        return entry ? entry.schema : null;
      },
      
      setSchema: (schemaId: string, schema: FormSchema) => {
        set((state) => {
          const newCache = new Map(state.schemaCache);
          newCache.set(schemaId, {
            schema,
            timestamp: Date.now(),
          });
          return { schemaCache: newCache };
        }, false, 'setSchema');
      },
      
      clearSchema: (schemaId: string) => {
        set((state) => {
          const newCache = new Map(state.schemaCache);
          newCache.delete(schemaId);
          return { schemaCache: newCache };
        }, false, 'clearSchema');
      },
      
      clearAllSchemas: () => {
        set({ schemaCache: new Map() }, false, 'clearAllSchemas');
      },
      
      hasSchema: (schemaId: string) => {
        return get().schemaCache.has(schemaId);
      },
      
      getCacheAge: (schemaId: string) => {
        const entry = get().schemaCache.get(schemaId);
        return entry ? Date.now() - entry.timestamp : null;
      },
    }),
    {
      name: 'schema-store',
    }
  )
);

