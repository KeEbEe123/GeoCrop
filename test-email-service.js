// Test script for email service
const testEmailService = async () => {
  const emailServiceUrl = 'https://geocropemailer.onrender.com';
  const apiKey = 'ym-email-service-2024-secure-key';

  console.log('🧪 Testing email service...');
  console.log('📍 URL:', emailServiceUrl);

  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${emailServiceUrl}/api/email/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test welcome email endpoint
    console.log('\n2. Testing welcome email endpoint...');
    const welcomeResponse = await fetch(`${emailServiceUrl}/api/email/send-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        role: 'farmer',
        location: 'Test Location'
      }),
    });

    console.log('📊 Response status:', welcomeResponse.status);
    console.log('📊 Response headers:', Object.fromEntries(welcomeResponse.headers.entries()));
    
    const welcomeData = await welcomeResponse.json();
    console.log('📧 Welcome email response:', welcomeData);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testEmailService();