const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Usage: node hash-password.js <password>');
  process.exit(1);
}

// Generate hash with salt rounds 10 (same as the app)
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nSQL to insert user:');
console.log(`INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES`);
console.log(`('email@example.com', '${hash}', 'Full Name', 'role', true);`); 