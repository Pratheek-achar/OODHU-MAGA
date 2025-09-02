// Simple API test script
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Notes Simplifier API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: Text processing
    console.log('\n2. Testing text processing...');
    const testText = 'This is a sample note about machine learning. Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.';
    
    const textResponse = await axios.post(`${BASE_URL}/api/process-text`, {
      text: testText
    });
    
    if (textResponse.data.success) {
      console.log('✅ Text processing successful');
      console.log(`   Original length: ${textResponse.data.originalLength}`);
      console.log(`   Simplified length: ${textResponse.data.simplifiedLength}`);
    } else {
      console.log('❌ Text processing failed');
    }

    // Test 3: Error handling
    console.log('\n3. Testing error handling...');
    try {
      await axios.post(`${BASE_URL}/api/process-text`, { text: '' });
      console.log('❌ Should have failed with empty text');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Error handling works correctly');
      } else {
        console.log('❌ Unexpected error response');
      }
    }

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
}

testAPI();