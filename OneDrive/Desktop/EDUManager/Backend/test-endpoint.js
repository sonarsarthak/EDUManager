const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEndpoint() {
  try {
    console.log('Testing timetable endpoint...');
    
    // Test the basic endpoint
    const response = await fetch('http://localhost:5000/api/timetable', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoint();