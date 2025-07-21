#!/usr/bin/env node

// Simple script to test database connectivity and run migrations
const { execSync } = require('child_process');

console.log('🔄 Starting database setup...');

try {
  console.log('📋 Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed successfully!');
  
  // Test database connection
  console.log('🔍 Testing database connection...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  async function testConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful!');
      
      // Check if tables exist
      const tableCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log(`📊 Found ${tableCount[0].count} tables in database`);
      
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      await prisma.$disconnect();
      process.exit(1);
    }
  }
  
  testConnection();
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
