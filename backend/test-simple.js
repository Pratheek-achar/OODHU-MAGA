// Simple test to check what's causing the error
import axios from 'axios';

async function testSimple() {
  try {
    console.log('Testing text processing...');
    
    const response = await axios.post('http://localhost:5000/api/process-text', {
      text: 'Machine learning is a subset of artificial intelligence. It uses algorithms to learn from data.'
    });
    
    console.log('Success!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error || error.message);
    console.error('Full error:', error.response?.data);
  }
}

testSimple();