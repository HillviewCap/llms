// Enhanced script to test the search-llms API endpoint
import fetch from 'node-fetch';

async function testSearchAPI(query = 'test', fileType = 'both', page = 1, limit = 10) {
  try {
    const url = new URL('http://localhost:4321/api/search-llms');
    url.searchParams.append('q', query);
    url.searchParams.append('fileType', fileType);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    console.log(`\nTesting search API with query: "${query}"`);
    console.log('URL:', url.toString());
    
    const response = await fetch(url);
    console.log('Response Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    
    // Check if the response is actually JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Response is not valid JSON:');
      console.error(text.substring(0, 500) + '...');  // Show first 500 chars of response
      return;
    }
    
    if (!response.ok) {
      console.error('API Error:', data.error || 'Unknown error');
      return;
    }
    
    console.log('\nAPI Response:');
    console.log('Status:', response.status);
    console.log('Total Results:', data.totalResults);
    console.log('Page:', data.page);
    console.log('Limit:', data.limit);
    console.log('Results returned:', data.results ? data.results.length : 0);
    
    if (data.results && data.results.length > 0) {
      console.log('\nSample Results:');
      data.results.slice(0, 2).forEach((result, index) => {
        console.log(`\nResult ${index + 1}:`);
        console.log('  Title:', result.title);
        console.log('  Domain:', result.domain);
        console.log('  URL:', result.url);
        if (result.summary) console.log('  Summary:', result.summary);
        console.log('  Last Updated:', result.last_updated);
        
        if (result.metadata) {
          console.log('  Top Topics:', result.metadata.url_topic_ranking?.slice(0, 2)
            .map(([topic, score]) => `${topic} (${score})`)
            .join(', '));
        }
      });
      
      if (data.results.length > 2) {
        console.log(`\n... and ${data.results.length - 2} more results`);
      }
    } else {
      console.log('\nNo results found for this query.');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
    console.error('Details:', error.message);
  }
}

// Process command line arguments
const args = process.argv.slice(2);
const query = args[0] || 'software';
const fileType = args[1] || 'both';
const page = parseInt(args[2], 10) || 1;
const limit = parseInt(args[3], 10) || 10;

console.log('===== LLMs Search API Tester =====');
console.log('Usage: node test-search-api.js [query] [fileType] [page] [limit]');
console.log(`Running with: query="${query}", fileType="${fileType}", page=${page}, limit=${limit}`);

testSearchAPI(query, fileType, page, limit);