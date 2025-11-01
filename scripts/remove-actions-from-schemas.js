/**
 * Script to remove actions from all-schemas.json
 * Actions are now handled dynamically with default labels
 */

const fs = require('fs');
const path = require('path');

const schemasPath = path.join(__dirname, '..', 'data', 'all-schemas.json');

console.log('Reading schemas file...');
const schemas = JSON.parse(fs.readFileSync(schemasPath, 'utf8'));

let totalActionsRemoved = 0;
let schemasModified = 0;

// Process each schema
schemas.forEach((schema, schemaIndex) => {
  if (!schema.actions) {
    return;
  }

  delete schema.actions;
  totalActionsRemoved++;
  schemasModified++;
  
  console.log(`Schema: ${schema.name || schema.id} - Removed actions`);
  console.log(`Schema ${schemaIndex + 1} complete\n`);
});

console.log(`\nTotal schemas modified: ${schemasModified}`);
console.log(`Total actions removed: ${totalActionsRemoved}`);

// Write the updated schemas back to the file
console.log('\nWriting updated schemas to file...');
fs.writeFileSync(schemasPath, JSON.stringify(schemas, null, 2), 'utf8');

console.log('\nDone! All actions have been removed from all-schemas.json.');

