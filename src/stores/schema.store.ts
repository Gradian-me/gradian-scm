import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { config } from '@/lib/config';

interface SchemaCacheEntry {
  schema: FormSchema;
  timestamp: number;
}

interface SchemaState {
  // Cache for schemas by ID
  schemaCache: Map<string, SchemaCacheEntry>;
  
  // In-flight fetch promises to deduplicate concurrent requests
  fetchPromises: Map<string, Promise<FormSchema | null>>;
  
  // Get schema from cache
  getSchema: (schemaId: string) => FormSchema | null;
  
  // Set schema in cache
  setSchema: (schemaId: string, schema: FormSchema) => void;
  
  // Fetch schema with deduplication (returns cached if available, or waits for in-flight request)
  fetchSchema: (schemaId: string) => Promise<FormSchema | null>;
  
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
      fetchPromises: new Map(),
      
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
      
      fetchSchema: async (schemaId: string): Promise<FormSchema | null> => {
        // Check cache first
        const cached = get().getSchema(schemaId);
        if (cached) {
          return cached;
        }
        
        // Check if there's already a fetch in progress
        const existingPromise = get().fetchPromises.get(schemaId);
        if (existingPromise) {
          return existingPromise;
        }
        
        // Create new fetch promise
        const fetchPromise = (async () => {
          try {
            // Use the configured schema API base URL (handles demo mode vs external API)
            const apiUrl = `${config.schemaApi.basePath}/${schemaId}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
              return null;
            }
            const result = await response.json();
            if (result.success && result.data) {
              // Cache the schema
              get().setSchema(schemaId, result.data);
              return result.data;
            }
            return null;
          } catch (error) {
            console.error(`Error fetching schema ${schemaId}:`, error);
            return null;
          } finally {
            // Remove the promise from the map after completion
            set((state) => {
              const newPromises = new Map(state.fetchPromises);
              newPromises.delete(schemaId);
              return { fetchPromises: newPromises };
            }, false, 'removeFetchPromise');
          }
        })();
        
        // Store the promise to deduplicate concurrent requests
        set((state) => {
          const newPromises = new Map(state.fetchPromises);
          newPromises.set(schemaId, fetchPromise);
          return { fetchPromises: newPromises };
        }, false, 'addFetchPromise');
        
        return fetchPromise;
      },
      
      clearSchema: (schemaId: string) => {
        set((state) => {
          const newCache = new Map(state.schemaCache);
          newCache.delete(schemaId);
          return { schemaCache: newCache };
        }, false, 'clearSchema');
      },
      
      clearAllSchemas: () => {
        set({ schemaCache: new Map(), fetchPromises: new Map() }, false, 'clearAllSchemas');
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

