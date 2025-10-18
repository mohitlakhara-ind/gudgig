// Test saved-jobs functionality
const testSavedJobs = async () => {
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice@gigsmint.com',
        password: 'Freelancer123!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.success);
    
    if (!loginData.success) {
      console.log('Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('Token received:', token.substring(0, 50) + '...');

    // Now test saved-jobs endpoint
    const savedJobsResponse = await fetch('http://localhost:5000/api/saved-jobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const savedJobsData = await savedJobsResponse.json();
    console.log('Saved jobs response:', JSON.stringify(savedJobsData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
};

testSavedJobs();

