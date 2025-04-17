// Simple script to test the search-llms API endpoint
import fetch from 'node-fetch';

async function testSearchAPI() {
  try {
    // Test with a simple query
    const response = await fetch('http://localhost:3000/api/search-llms?q=test');
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Total Results:', data.totalResults);
    console.log('Results Length:', data.results ? data.results.length : 'undefined');
    console.log('First few results:', data.results ? data.results.slice(0, 2) : 'No results');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testSearchAPI();