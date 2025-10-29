// Test script to verify schema registry
// Run with: npx ts-node src/shared/schemas/test-schema-registry.ts

import { vendorSchema, ALL_SCHEMAS, getAllSchemaIds, schemaExists } from './all-schemas';
import { getSchemaById, findSchemaById, getSchemaMetadata } from '../utils/schema-registry';

console.log('=== Schema Registry Test ===\n');

// Test 1: Check if vendor schema is loaded
console.log('Test 1: Vendor schema loaded?');
console.log('✓ Vendor schema ID:', vendorSchema.id);
console.log('✓ Vendor schema name:', vendorSchema.name);
console.log('✓ Sections count:', vendorSchema.sections.length);

// Test 2: Get all schema IDs
console.log('\nTest 2: All registered schemas:');
const schemaIds = getAllSchemaIds();
console.log('✓ Schema IDs:', schemaIds);

// Test 3: Check if vendor exists
console.log('\nTest 3: Schema existence check:');
console.log('✓ "vendors" exists?', schemaExists('vendors'));
console.log('✓ "invalid" exists?', schemaExists('invalid'));

// Test 4: Find schema by ID
console.log('\nTest 4: Find schema by ID:');
const foundSchema = findSchemaById('vendors');
console.log('✓ Found vendors?', foundSchema !== null);
console.log('✓ Schema title:', foundSchema?.title);

// Test 5: Get schema metadata
console.log('\nTest 5: Get schema metadata:');
const metadata = getSchemaMetadata('vendors');
console.log('✓ Metadata:', JSON.stringify(metadata, null, 2));

// Test 6: Get schema (throws on error)
console.log('\nTest 6: Get schema with getSchemaById:');
try {
  const schema = getSchemaById('vendors');
  console.log('✓ Schema retrieved:', schema.id);
} catch (error) {
  console.log('✗ Error:', error);
}

// Test 7: Try to get invalid schema
console.log('\nTest 7: Try to get invalid schema:');
try {
  const schema = getSchemaById('invalid-schema');
  console.log('✗ Should have thrown error');
} catch (error) {
  console.log('✓ Error caught as expected:', (error as Error).message);
}

console.log('\n=== All Tests Completed ===');

