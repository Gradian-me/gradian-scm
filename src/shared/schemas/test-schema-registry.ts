// Test script to verify schema registry with JSON-based schemas
// Run with: npx ts-node src/shared/schemas/test-schema-registry.ts

import { getAllSchemaIds, schemaExists, getSchemaById, findSchemaById, getSchemaMetadata, getAllSchemasArray } from './all-schemas';

console.log('=== Schema Registry Test (JSON-based) ===\n');

// Test 1: Get all schema IDs
console.log('Test 1: All registered schemas:');
const schemaIds = getAllSchemaIds();
console.log('✓ Schema IDs:', schemaIds);
console.log('✓ Total schemas:', schemaIds.length);

// Test 2: Get all schemas array
console.log('\nTest 2: Load all schemas:');
const allSchemas = getAllSchemasArray();
console.log('✓ Loaded schemas:', allSchemas.length);
allSchemas.forEach(schema => {
  console.log(`  - ${schema.id}: ${schema.title} (${schema.sections.length} sections)`);
});

// Test 3: Check if vendor exists
console.log('\nTest 3: Schema existence check:');
console.log('✓ "vendors" exists?', schemaExists('vendors'));
console.log('✓ "invalid" exists?', schemaExists('invalid'));

// Test 4: Find schema by ID
console.log('\nTest 4: Find schema by ID:');
const foundSchema = findSchemaById('vendors');
console.log('✓ Found vendors?', foundSchema !== null);
console.log('✓ Schema title:', foundSchema?.title);
console.log('✓ Schema ID:', foundSchema?.id);
console.log('✓ Sections count:', foundSchema?.sections.length);

// Test 5: Get schema metadata
console.log('\nTest 5: Get schema metadata:');
const metadata = getSchemaMetadata('vendors');
console.log('✓ Metadata:', JSON.stringify(metadata, null, 2));

// Test 6: Get schema (throws on error)
console.log('\nTest 6: Get schema with getSchemaById:');
try {
  const schema = getSchemaById('vendors');
  console.log('✓ Schema retrieved:', schema.id);
  console.log('✓ Schema name:', schema.name);
  console.log('✓ First section:', schema.sections[0]?.title);
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

// Test 8: Verify RegExp patterns are properly converted
console.log('\nTest 8: Verify RegExp conversion:');
const vendorSchema = getSchemaById('vendors');
const emailField = vendorSchema.sections[0]?.fields.find(f => f.id === 'email-address');
console.log('✓ Email field found:', emailField !== undefined);
console.log('✓ Pattern is RegExp:', emailField?.validation?.pattern instanceof RegExp);
console.log('✓ Pattern source:', emailField?.validation?.pattern?.source);

console.log('\n=== All Tests Completed ===');

