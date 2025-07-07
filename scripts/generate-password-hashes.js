#!/usr/bin/env node

const bcrypt = require('bcrypt');

// User passwords as specified
const passwords = {
  'tom': 'tom123',
  'nick': 'lglpPsalm23',
  'bookkeeper': 'bookkeeper123',
  'salecker': 'salecker123',
  'annapolis': 'annapolis123',
  'fellspoint': 'fellspoint123',
  'renoja': 'renoja123'
};

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  const saltRounds = 10;
  const hashes = {};
  
  for (const [username, password] of Object.entries(passwords)) {
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      hashes[username] = hash;
      console.log(`${username}: ${hash}`);
    } catch (error) {
      console.error(`Error generating hash for ${username}:`, error);
    }
  }
  
  console.log('\n=== SQL UPDATE STATEMENTS ===');
  console.log('-- Update the migration script with these hashes:\n');
  
  for (const [username, hash] of Object.entries(hashes)) {
    console.log(`-- ${username}: ${hash}`);
  }
  
  console.log('\n=== COPY THIS INTO THE MIGRATION SCRIPT ===\n');
  
  console.log("INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES");
  console.log("  -- Admin/Executive Users");
  console.log(`  ('tom', '${hashes.tom}', 'Tom (Admin)', 'executive', true),`);
  console.log(`  ('nick', '${hashes.nick}', 'Nick (Executive)', 'executive', true),`);
  console.log("  ");
  console.log("  -- Bookkeeper");
  console.log(`  ('bookkeeper', '${hashes.bookkeeper}', 'Bookkeeper', 'bookkeeper', true),`);
  console.log("  ");
  console.log("  -- Store Managers");
  console.log(`  ('salecker', '${hashes.salecker}', 'Salecker (Multi-Store Manager)', 'manager', true),`);
  console.log(`  ('annapolis', '${hashes.annapolis}', 'Annapolis Store Manager', 'manager', true),`);
  console.log(`  ('fellspoint', '${hashes.fellspoint}', 'Fells Point Store Manager', 'manager', true),`);
  console.log(`  ('renoja', '${hashes.renoja}', 'Renoja Manager', 'manager', true);`);
}

generateHashes().catch(console.error); 