#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

// Configuration
const API_BASE_URL = 'https://pmackstack-production-93dc.up.railway.app/api';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Available roles
const ROLES = ['executive', 'bookkeeper', 'manager'];

// Available stores for managers
const STORES = {
  kilwins: ['anna', 'char', 'fell', 'vabe', 'will'],
  renoja: ['ren001', 'ren002', 'ren003']
};

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'pmackstack-production-93dc.up.railway.app',
      port: 443,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: result
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function login() {
  console.log('\n🔐 Login as Executive to Create Users');
  console.log('=====================================');
  
  const email = await question('Executive Email: ');
  const password = await question('Password: ');
  
  try {
    const response = await makeRequest('/auth/login', 'POST', {
      email: email,
      password: password
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Login successful!');
      return response.data.data.token;
    } else {
      console.error('❌ Login failed:', response.data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

async function createUser(token) {
  console.log('\n👤 Create New User');
  console.log('==================');
  
  const email = await question('Email: ');
  const fullName = await question('Full Name: ');
  const password = await question('Password: ');
  
  console.log('\nAvailable Roles:');
  ROLES.forEach((role, index) => {
    console.log(`${index + 1}. ${role}`);
  });
  
  const roleChoice = await question('Select Role (1-3): ');
  const role = ROLES[parseInt(roleChoice) - 1];
  
  if (!role) {
    console.error('❌ Invalid role selection');
    return false;
  }
  
  try {
    const response = await makeRequest('/users', 'POST', {
      email: email,
      fullName: fullName,
      password: password,
      role: role
    }, token);
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ User created successfully!');
      console.log('User Details:', response.data.data);
      
      // If manager, offer to assign stores
      if (role === 'manager') {
        const assignStores = await question('\nAssign stores to this manager? (y/n): ');
        if (assignStores.toLowerCase() === 'y') {
          await assignStoresToManager(response.data.data.id, token);
        }
      }
      
      return true;
    } else {
      console.error('❌ User creation failed:', response.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    return false;
  }
}

async function assignStoresToManager(userId, token) {
  console.log('\n🏪 Assign Stores to Manager');
  console.log('===========================');
  
  console.log('Kilwins Stores:', STORES.kilwins.join(', '));
  console.log('Renoja Stores:', STORES.renoja.join(', '));
  
  const storeInput = await question('Enter store codes (comma-separated): ');
  const storeCodes = storeInput.split(',').map(s => s.trim());
  
  console.log('\n📝 Note: Store assignment requires database direct access.');
  console.log('Store codes to assign:', storeCodes);
  console.log('You can manually assign these stores using the database console.');
  
  return storeCodes;
}

async function listUsers(token) {
  console.log('\n📋 Current Users');
  console.log('================');
  
  try {
    const response = await makeRequest('/users', 'GET', null, token);
    
    if (response.status === 200 && response.data.success) {
      console.table(response.data.data.map(user => ({
        ID: user.id,
        Email: user.email,
        Name: user.full_name,
        Role: user.role,
        Active: user.is_active ? '✅' : '❌',
        Created: new Date(user.created_at).toLocaleDateString()
      })));
    } else {
      console.error('❌ Failed to fetch users:', response.data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  }
}

async function main() {
  console.log('🚀 User Management Tool');
  console.log('========================');
  
  const token = await login();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    rl.close();
    return;
  }
  
  while (true) {
    console.log('\n📋 What would you like to do?');
    console.log('1. Create new user');
    console.log('2. List all users');
    console.log('3. Exit');
    
    const choice = await question('Select option (1-3): ');
    
    switch (choice) {
      case '1':
        await createUser(token);
        break;
      case '2':
        await listUsers(token);
        break;
      case '3':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid choice');
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Run the script
main().catch(console.error); 