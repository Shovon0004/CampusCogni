#!/usr/bin/env node

// Simple script to test database connectivity and run migrations
const { execSync } = require('child_process');

console.log('🔄 Starting database setup...');
console.log('📊 Environment check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

try {
  console.log('📋 Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
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
      
      // List all tables
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log('📋 Tables in database:', tables.map(t => t.table_name).join(', '));
      
      await prisma.$disconnect();
      console.log('🎉 Database setup verification completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('🔍 Full error:', error);
      await prisma.$disconnect();
      process.exit(1);
    }
  }
  
  testConnection();
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.error('🔍 Command output:', error.stdout?.toString());
  console.error('🔍 Command error:', error.stderr?.toString());
  process.exit(1);
}
