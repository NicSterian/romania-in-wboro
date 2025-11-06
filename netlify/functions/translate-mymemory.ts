import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { q, source, target } = JSON.parse(event.body || '{}');

    if (!q || !target) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // MyMemory API endpoint
    const sourceCode = source || 'ro';
    const targetCode = target || 'en';
    const text = encodeURIComponent(q);

    const url = `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceCode}|${targetCode}`;

    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Translation service error' }),
      };
    }

    const data = await response.json();

    // MyMemory returns: { responseData: { translatedText: "..." } }
    const translatedText = data?.responseData?.translatedText || q;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ translatedText }),
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
