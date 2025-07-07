#!/usr/bin/env node

const https = require('https');

// Test API URL - can be overridden with environment variable
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3002';

// Test users with their expected passwords
const testUsers = [
  { username: 'tom', password: 'tom123', role: 'executive', description: 'Admin/Executive' },
  { username: 'nick', password: 'lglpPsalm23', role: 'executive', description: 'Executive' },
  { username: 'bookkeeper', password: 'bookkeeper123', role: 'bookkeeper', description: 'Bookkeeper' },
  { username: 'salecker', password: 'salecker123', role: 'manager', description: 'Multi-Store Manager' },
  { username: 'annapolis', password: 'annapolis123', role: 'manager', description: 'Annapolis Store Manager' },
  { username: 'fellspoint', password: 'fellspoint123', role: 'manager', description: 'Fells Point Store Manager' },
  { username: 'renoja', password: 'renoja123', role: 'manager', description: 'Renoja Manager' }
];

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    // Handle both HTTP and HTTPS
    const lib = url.startsWith('https://') ? https : require('http');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = lib.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
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

async function testLogin(username, password) {
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, 'POST', {
      email: username,
      password: password
    });

    return {
      success: response.status === 200,
      status: response.status,
      data: response.body,
      token: response.body.data?.token
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testProtectedEndpoint(token) {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores`);
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const lib = url.protocol === 'https:' ? https : require('http');
    
    return new Promise((resolve, reject) => {
      const req = lib.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              success: res.statusCode === 200,
              status: res.statusCode,
              data: parsedBody
            });
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              body: body
            });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runLoginTests() {
  console.log('🔐 Testing User Login Authentication');
  console.log('====================================');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log();

  let passedTests = 0;
  let failedTests = 0;

  for (const user of testUsers) {
    console.log(`👤 Testing ${user.username} (${user.description})...`);
    
    // Test login
    const loginResult = await testLogin(user.username, user.password);
    
    if (loginResult.success) {
      console.log(`  ✅ Login successful`);
      console.log(`  📋 Role: ${loginResult.data?.data?.user?.role || 'Unknown'}`);
      console.log(`  🎫 Token: ${loginResult.token ? 'Generated' : 'Missing'}`);
      
      // Test protected endpoint
      if (loginResult.token) {
        const protectedResult = await testProtectedEndpoint(loginResult.token);
        if (protectedResult.success) {
          console.log(`  🔓 Protected endpoint access: ✅ Success`);
          console.log(`  🏪 Can access ${protectedResult.data?.data?.stores?.length || 0} stores`);
        } else {
          console.log(`  🔓 Protected endpoint access: ❌ Failed (${protectedResult.status})`);
        }
      }
      
      passedTests++;
    } else {
      console.log(`  ❌ Login failed (Status: ${loginResult.status})`);
      if (loginResult.error) {
        console.log(`  🚨 Error: ${loginResult.error}`);
      }
      if (loginResult.data?.error) {
        console.log(`  🚨 Server Error: ${loginResult.data.error}`);
      }
      failedTests++;
    }
    console.log();
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${testUsers.length}`);
  console.log(`❌ Failed: ${failedTests}/${testUsers.length}`);
  
  const successRate = (passedTests / testUsers.length) * 100;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 All login tests passed! Authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some login tests failed. Please check the migration and server configuration.');
    process.exit(1);
  }
}

// Test server connectivity first
async function testServerConnection() {
  try {
    console.log('🔌 Testing server connectivity...');
    const healthCheck = await makeRequest(`${API_BASE_URL}/health`);
    
    if (healthCheck.status === 200) {
      console.log('✅ Server is reachable');
      return true;
    } else {
      console.log(`⚠️  Server responded with status ${healthCheck.status}`);
      return true; // Continue anyway, might be that health endpoint doesn't exist
    }
  } catch (error) {
    console.log(`❌ Server connection failed: ${error.message}`);
    console.log('💡 Make sure your server is running and the API_URL is correct');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🧪 Login Authentication Test Suite');
  console.log('===================================\n');
  
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('\n🔧 Server connection issues detected. Please check:');
    console.log('   1. Server is running (npm run dev in server directory)');
    console.log('   2. API_URL is correct');
    console.log('   3. Database is accessible');
    process.exit(1);
  }
  
  console.log();
  await runLoginTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLogin, runLoginTests }; 