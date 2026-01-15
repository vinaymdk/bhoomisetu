#!/usr/bin/env node

/**
 * Load Sample Data Script (Node.js version)
 * This script loads all sample data files into the PostgreSQL database
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

// Configuration (modify these as needed or use environment variables)
const config = {
  dbName: process.env.DB_NAME || 'bhoomisetu_db',
  dbUser: process.env.DB_USER || 'postgres',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || '5432',
  dbPassword: process.env.DB_PASSWORD || 'vinaymdk',
};

const projectRoot = path.resolve(__dirname, '..');
const sampleDataDir = path.join(projectRoot, 'db', 'sample-data');

// SQL files to load in order
const sqlFiles = [
  { file: 'module1_auth_sample_data.sql', description: 'Module 1: Authentication & Users' },
  { file: 'module2_properties_sample_data.sql', description: 'Module 2: Properties' },
  { file: 'module3_search_sample_data.sql', description: 'Module 3: Search Properties' },
];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPsql() {
  try {
    execSync('psql --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkDatabase() {
  try {
    const cmd = `PGPASSWORD="${config.dbPassword}" psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -c '\\q'`;
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function loadSqlFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    log(`Error: File not found: ${filePath}`, 'red');
    return false;
  }

  log(`Loading: ${description}`, 'yellow');
  
  try {
    const cmd = `PGPASSWORD="${config.dbPassword}" psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -f "${filePath}"`;
    execSync(cmd, { stdio: 'ignore' });
    log(`✓ Successfully loaded: ${description}`, 'green');
    return true;
  } catch (error) {
    log(`✗ Failed to load: ${description}`, 'red');
    return false;
  }
}

function getCount(query) {
  try {
    const cmd = `PGPASSWORD="${config.dbPassword}" psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -t -c "${query}"`;
    const result = execSync(cmd, { encoding: 'utf8' });
    return parseInt(result.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

// Main execution
function main() {
  log('=== Bhoomisetu Sample Data Loader ===', 'green');
  console.log('');

  // Check if psql is available
  if (!checkPsql()) {
    log('Error: psql command not found. Please install PostgreSQL client tools.', 'red');
    process.exit(1);
  }

  // Check database connection
  log('Checking database connection...', 'yellow');
  if (!checkDatabase()) {
    log(`Error: Cannot connect to database '${config.dbName}'`, 'red');
    log('Please check your database configuration:', 'yellow');
    log(`  DB_NAME: ${config.dbName}`, 'yellow');
    log(`  DB_USER: ${config.dbUser}`, 'yellow');
    log(`  DB_HOST: ${config.dbHost}`, 'yellow');
    log(`  DB_PORT: ${config.dbPort}`, 'yellow');
    process.exit(1);
  }

  log('Database connection successful!', 'green');
  console.log('');

  // Load SQL files
  log('Loading sample data files...', 'yellow');
  console.log('');

  let allSuccess = true;
  for (const { file, description } of sqlFiles) {
    const filePath = path.join(sampleDataDir, file);
    if (!loadSqlFile(filePath, description)) {
      allSuccess = false;
    }
    console.log('');
  }

  // Verify data
  log('Verifying loaded data...', 'yellow');
  
  const userCount = getCount("SELECT COUNT(*) FROM users WHERE id LIKE 'user-%';");
  const propCount = getCount("SELECT COUNT(*) FROM properties WHERE id LIKE 'prop-%';");
  const roleCount = getCount("SELECT COUNT(*) FROM roles WHERE id LIKE 'role-%';");

  log('Data Summary:', 'green');
  log(`  Users: ${userCount}`, 'green');
  log(`  Properties: ${propCount}`, 'green');
  log(`  Roles: ${roleCount}`, 'green');
  console.log('');

  if (userCount > 0 && propCount > 0) {
    log('✓ Sample data loaded successfully!', 'green');
    console.log('');
    log('You can now test the application with this sample data.', 'green');
    log('See db/sample-data/README.md for user credentials.', 'green');
  } else {
    log('⚠ Warning: Some data may not have loaded correctly.', 'yellow');
    log('Please check the database manually.', 'yellow');
  }

  process.exit(allSuccess ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };

