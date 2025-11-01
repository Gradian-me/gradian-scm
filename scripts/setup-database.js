#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Gradian App Database...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created. Please update DATABASE_URL with your PostgreSQL connection string.');
  console.log('   Example: DATABASE_URL="postgresql://username:password@localhost:5432/gradian_scm?schema=public"');
  console.log('');
}

// Check if Prisma is installed
try {
  require('@prisma/client');
  console.log('✅ Prisma client is installed');
} catch (error) {
  console.log('❌ Prisma client not found. Installing...');
  execSync('npm install @prisma/client', { stdio: 'inherit' });
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Check database connection
console.log('🔍 Checking database connection...');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database schema pushed successfully');
} catch (error) {
  console.log('❌ Failed to push database schema. Please check your DATABASE_URL in .env file.');
  console.log('   Make sure PostgreSQL is running and the database exists.');
  process.exit(1);
}

// Seed database
console.log('🌱 Seeding database with mock data...');
try {
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');
} catch (error) {
  console.log('❌ Failed to seed database:', error.message);
  process.exit(1);
}

console.log('\n🎉 Database setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Update DATA_SOURCE="database" in your .env file');
console.log('2. Restart your development server: npm run dev');
console.log('3. Open Prisma Studio to view your data: npm run db:studio');
console.log('\nFor more information, see DATABASE_SETUP.md');
