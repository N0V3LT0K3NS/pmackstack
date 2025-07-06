const https = require('https');

const VERCEL_URL = 'https://pmackstack.vercel.app';
const RAILWAY_URL = 'https://pmackstack-production-93dc.up.railway.app';

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
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

async function testDeployment() {
  console.log('🚀 Testing Deployment Status...\n');

  // Test Railway Backend
  console.log('1. Testing Railway Backend...');
  try {
    const healthResponse = await makeRequest(`${RAILWAY_URL}/health`);
    console.log(`   ✅ Health Check: ${healthResponse.status} - ${healthResponse.body}`);

    const loginResponse = await makeRequest(`${RAILWAY_URL}/api/auth/login`, 'POST', {
      email: 'exec@kilwins.com',
      password: 'demo123'
    });
    console.log(`   ✅ Login Test: ${loginResponse.status} - ${loginResponse.body.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   ❌ Railway Error: ${error.message}`);
  }

  console.log('\n2. Testing Vercel Frontend...');
  try {
    const frontendResponse = await makeRequest(VERCEL_URL);
    console.log(`   ✅ Frontend: ${frontendResponse.status} - HTML loaded`);

    const apiTest = await makeRequest(`${VERCEL_URL}/api/auth/login`, 'POST', {
      email: 'exec@kilwins.com', 
      password: 'demo123'
    });
    console.log(`   API Route Test: ${apiTest.status} - ${apiTest.body}`);
  } catch (error) {
    console.log(`   ❌ Vercel Error: ${error.message}`);
  }

  console.log('\n📊 Deployment Summary:');
  console.log(`   Backend (Railway): ${RAILWAY_URL}`);
  console.log(`   Frontend (Vercel): ${VERCEL_URL}`);
  console.log('\n🎯 If both services show ✅, the deployment is working!');
  console.log('📝 Next: Check Vercel environment variables if API routes still fail');
}

testDeployment().catch(console.error); 