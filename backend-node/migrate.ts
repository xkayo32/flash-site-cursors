#!/usr/bin/env ts-node

import { migrationService } from './src/services/migrationService';

async function main() {
  console.log('🔧 JSON to PostgreSQL Migration Tool');
  console.log('=====================================\n');
  
  try {
    await migrationService.runMigration();
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  main();
}