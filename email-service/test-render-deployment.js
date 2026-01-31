#!/usr/bin/env node

/**
 * Test script to verify email service deployment on Render
 * Run this after deploying to test all functionality
 */

const SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'https://geocropemailer.onrender.com';
const API_KEY = process.env.API_KEY || 'ym-email-service-2024-secure-key';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

console.log('🧪 Testing Render Email Service Deployment');
console.log(`📍 Service URL: ${SERVICE_URL}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
console.log('');

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`🔍 Testing ${name}...`);
    const response = await fetch(url, {
      timeout: 30000, // 30 second timeout
      ...options
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS`);
      if (data.status) {
        console.log(`   Status: ${JSON.stringify(data.status, null, 2)}`);
      }
      return true;
    } else {
      console.log(`❌ ${name}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR`);
    console.log(`   ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting deployment tests...\n');
  
  const tests = [
    {
      name: 'Basic Health Check',
      url: `${SERVICE_URL}/api/email/health`
    },
    {
      name: 'SMTP Connection Test',
      url: `${SERVICE_URL}/api/email/health?testSmtp=true`
    },
    {
      name: 'Root Endpoint',
      url: `${SERVICE_URL}/`
    },
    {
      name: 'Send Test Email',
      url: `${SERVICE_URL}/api/email/test`,
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          email: TEST_EMAIL
        })
      }
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url, test.options);
    if (success) passed++;
    console.log(''); // Empty line between tests
  }
  
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Email service is working correctly on Render.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
    console.log('💡 Common issues:');
    console.log('   - SMTP timeout: Check Gmail App Password and network connectivity');
    console.log('   - API key errors: Verify API_KEY environment variable');
    console.log('   - Service not ready: Wait a few minutes after deployment');
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node test-render-deployment.js [options]');
  console.log('');
  console.log('Environment Variables:');
  console.log('  EMAIL_SERVICE_URL  - URL of deployed email service (default: https://geocropemailer.onrender.com)');
  console.log('  API_KEY           - API key for authentication (default: ym-email-service-2024-secure-key)');
  console.log('  TEST_EMAIL        - Email address for test email (default: test@example.com)');
  console.log('');
  console.log('Examples:');
  console.log('  EMAIL_SERVICE_URL=https://myservice.onrender.com node test-render-deployment.js');
  console.log('  TEST_EMAIL=myemail@gmail.com node test-render-deployment.js');
  process.exit(0);
}

runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});