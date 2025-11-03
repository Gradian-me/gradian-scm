// Relations Storage Utility
// Handles reading and writing to all-data-relations.json file
// SERVER-ONLY: This file uses Node.js fs module and can only be used in server-side code (API routes, server components)

import fs from 'fs';
import path from 'path';
import { DataStorageError } from '../errors/domain.errors';
import { DataRelation } from '@/gradian-ui/schema-manager/types/form-schema';
import { ulid } from 'ulid';

const RELATIONS_FILE_PATH = path.join(process.cwd(), 'data', 'all-data-relations.json');

/**
 * Ensure data directory and relations file exist
 */
function ensureRelationsFile(): void {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(RELATIONS_FILE_PATH)) {
    const initialData: DataRelation[] = [];
    fs.writeFileSync(RELATIONS_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

/**
 * Read all relations from the JSON file
 */
export function readAllRelations(): DataRelation[] {
  try {
    ensureRelationsFile();
    const rawData = fs.readFileSync(RELATIONS_FILE_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    throw new DataStorageError('read relations', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Write all relations to the JSON file
 */
export function writeAllRelations(relations: DataRelation[]): void {
  try {
    ensureRelationsFile();
    fs.writeFileSync(RELATIONS_FILE_PATH, JSON.stringify(relations, null, 2), 'utf-8');
  } catch (error) {
    throw new DataStorageError('write relations', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Create a new relation
 */
export function createRelation(relation: Omit<DataRelation, 'id' | 'createdAt' | 'updatedAt'>): DataRelation {
  try {
    const relations = readAllRelations();
    const now = new Date().toISOString();
    const newRelation: DataRelation = {
      ...relation,
      id: ulid(),
      createdAt: now,
      updatedAt: now,
    };
    relations.push(newRelation);
    writeAllRelations(relations);
    return newRelation;
  } catch (error) {
    throw new DataStorageError('create relation', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Delete a relation by ID
 */
export function deleteRelation(relationId: string): void {
  try {
    const relations = readAllRelations();
    const filtered = relations.filter(r => r.id !== relationId);
    
    if (filtered.length === relations.length) {
      throw new Error(`Relation not found: ${relationId}`);
    }
    
    writeAllRelations(filtered);
  } catch (error) {
    throw new DataStorageError('delete relation', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get relation by ID
 */
export function getRelationById(relationId: string): DataRelation | null {
  try {
    const relations = readAllRelations();
    return relations.find(r => r.id === relationId) || null;
  } catch (error) {
    throw new DataStorageError('get relation', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get relations by source entity
 */
export function getRelationsBySource(sourceSchema: string, sourceId: string): DataRelation[] {
  try {
    const relations = readAllRelations();
    return relations.filter(r => r.sourceSchema === sourceSchema && r.sourceId === sourceId);
  } catch (error) {
    throw new DataStorageError('get relations by source', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get relations by target entity
 */
export function getRelationsByTarget(targetSchema: string, targetId: string): DataRelation[] {
  try {
    const relations = readAllRelations();
    return relations.filter(r => r.targetSchema === targetSchema && r.targetId === targetId);
  } catch (error) {
    throw new DataStorageError('get relations by target', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get relations by relation type
 */
export function getRelationsByType(relationTypeId: string): DataRelation[] {
  try {
    const relations = readAllRelations();
    return relations.filter(r => r.relationTypeId === relationTypeId);
  } catch (error) {
    throw new DataStorageError('get relations by type', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get relations for a repeating section (by source, relation type, and optionally target schema)
 */
export function getRelationsForSection(
  sourceSchema: string,
  sourceId: string,
  relationTypeId: string,
  targetSchema?: string
): DataRelation[] {
  try {
    const relations = readAllRelations();
    return relations.filter(r => {
      const matches = r.sourceSchema === sourceSchema && 
                      r.sourceId === sourceId && 
                      r.relationTypeId === relationTypeId;
      
      if (targetSchema) {
        return matches && r.targetSchema === targetSchema;
      }
      
      return matches;
    });
  } catch (error) {
    throw new DataStorageError('get relations for section', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Delete relations by source entity
 */
export function deleteRelationsBySource(sourceSchema: string, sourceId: string): number {
  try {
    const relations = readAllRelations();
    const filtered = relations.filter(r => !(r.sourceSchema === sourceSchema && r.sourceId === sourceId));
    const deletedCount = relations.length - filtered.length;
    writeAllRelations(filtered);
    return deletedCount;
  } catch (error) {
    throw new DataStorageError('delete relations by source', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Delete relations by target entity
 */
export function deleteRelationsByTarget(targetSchema: string, targetId: string): number {
  try {
    const relations = readAllRelations();
    const filtered = relations.filter(r => !(r.targetSchema === targetSchema && r.targetId === targetId));
    const deletedCount = relations.length - filtered.length;
    writeAllRelations(filtered);
    return deletedCount;
  } catch (error) {
    throw new DataStorageError('delete relations by target', error instanceof Error ? error.message : 'Unknown error');
  }
}

