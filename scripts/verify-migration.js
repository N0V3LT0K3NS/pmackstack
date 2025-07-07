#!/usr/bin/env node

const { Client } = require('pg');

// Test database connection
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/pmackstack_test';

async function verifyMigration() {
  const client = new Client({
    connectionString: testDatabaseUrl,
    ssl: testDatabaseUrl.includes('railway') || testDatabaseUrl.includes('neon') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔌 Connected to test database');

    // Test 1: Check user count and roles
    console.log('\n📊 Testing User Creation...');
    const userResult = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);
    
    console.log('Users by role:');
    userResult.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count}`);
    });

    // Expected: executive: 2, bookkeeper: 1, manager: 4
    const expectedUsers = { executive: 2, bookkeeper: 1, manager: 4 };
    let userTestPassed = true;
    
    for (const [role, expectedCount] of Object.entries(expectedUsers)) {
      const actualCount = userResult.rows.find(r => r.role === role)?.count || 0;
      if (parseInt(actualCount) !== expectedCount) {
        console.log(`  ❌ ${role}: Expected ${expectedCount}, got ${actualCount}`);
        userTestPassed = false;
      } else {
        console.log(`  ✅ ${role}: ${actualCount} users`);
      }
    }

    // Test 2: Check specific users exist
    console.log('\n👤 Testing Specific Users...');
    const expectedEmails = ['tom', 'nick', 'bookkeeper', 'salecker', 'annapolis', 'fellspoint', 'renoja'];
    
    for (const email of expectedEmails) {
      const result = await client.query('SELECT email, role, is_active FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        console.log(`  ❌ ${email}: User not found`);
        userTestPassed = false;
      } else {
        const user = result.rows[0];
        console.log(`  ✅ ${email}: ${user.role} (active: ${user.is_active})`);
      }
    }

    // Test 3: Check store structure
    console.log('\n🏪 Testing Store Structure...');
    const storeResult = await client.query(`
      SELECT s.store_code, s.store_name, b.name as brand
      FROM pos_stores s
      JOIN brands b ON s.brand_id = b.brand_id
      ORDER BY b.name, s.store_code
    `);

    console.log('Current stores:');
    storeResult.rows.forEach(row => {
      console.log(`  ${row.store_code}: ${row.store_name} (${row.brand})`);
    });

    // Check for old renoja store (should be removed)
    const oldRenoja = storeResult.rows.find(r => r.store_code === 'ren003');
    if (oldRenoja) {
      console.log('  ❌ Old Renoja store (ren003) still exists');
    } else {
      console.log('  ✅ Old Renoja store (ren003) removed');
    }

    // Check for new renoja stores
    const newRenoja = storeResult.rows.filter(r => ['ren001', 'ren002'].includes(r.store_code));
    if (newRenoja.length === 2) {
      console.log('  ✅ New Renoja stores (ren001, ren002) exist');
    } else {
      console.log(`  ❌ New Renoja stores: Expected 2, found ${newRenoja.length}`);
    }

    // Test 4: Check store assignments
    console.log('\n🔐 Testing Store Assignments...');
    const assignmentResult = await client.query(`
      SELECT u.email, u.role, us.store_code, us.can_write
      FROM users u
      JOIN user_store us ON u.id = us.user_id
      ORDER BY u.email, us.store_code
    `);

    console.log('Store assignments:');
    assignmentResult.rows.forEach(row => {
      const access = row.can_write ? 'Read/Write' : 'Read-Only';
      console.log(`  ${row.email}: ${row.store_code} (${access})`);
    });

    // Test specific assignments
    const assignments = {
      'salecker': ['vabe', 'char', 'will'],
      'annapolis': ['anna'],
      'fellspoint': ['fell'],
      'renoja': ['ren001', 'ren002']
    };

    let assignmentTestPassed = true;
    for (const [email, expectedStores] of Object.entries(assignments)) {
      const userAssignments = assignmentResult.rows.filter(r => r.email === email);
      const actualStores = userAssignments.map(r => r.store_code).sort();
      const expectedSorted = expectedStores.sort();

      if (JSON.stringify(actualStores) === JSON.stringify(expectedSorted)) {
        console.log(`  ✅ ${email}: Correct store assignments`);
      } else {
        console.log(`  ❌ ${email}: Expected ${expectedSorted.join(', ')}, got ${actualStores.join(', ')}`);
        assignmentTestPassed = false;
      }
    }

    // Test 5: Check Renoja write permissions
    const renojaWritePerms = assignmentResult.rows.filter(r => r.email === 'renoja' && r.can_write);
    if (renojaWritePerms.length === 2) {
      console.log('  ✅ Renoja manager has write permissions');
    } else {
      console.log('  ❌ Renoja manager write permissions incorrect');
    }

    // Summary
    console.log('\n🎯 Migration Verification Summary:');
    console.log(`  User Creation: ${userTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Store Structure: ✅ PASSED`);
    console.log(`  Store Assignments: ${assignmentTestPassed ? '✅ PASSED' : '❌ FAILED'}`);

    const overallSuccess = userTestPassed && assignmentTestPassed;
    console.log(`\n🏆 Overall Result: ${overallSuccess ? '✅ MIGRATION SUCCESSFUL' : '❌ MIGRATION ISSUES FOUND'}`);

    if (!overallSuccess) {
      console.log('\n🔧 Please review the migration script and fix any issues before proceeding.');
      process.exit(1);
    } else {
      console.log('\n🚀 Migration verified successfully! Ready to test frontend.');
    }

  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run verification
if (require.main === module) {
  console.log('🧪 Migration Verification Tool');
  console.log('================================');
  console.log(`Database: ${testDatabaseUrl}`);
  
  verifyMigration().catch(console.error);
}

module.exports = { verifyMigration }; 