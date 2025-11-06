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

    // Check which API to use (LibreTranslate or MyMemory)
    const translationUrl = process.env.LT_URL || 'https://libretranslate.com/translate';
    console.log('[DEBUG] Translation URL:', translationUrl);

    // MyMemory uses GET with query params
    if (translationUrl.includes('mymemory')) {
      const sourceCode = source || 'ro';
      const targetCode = target || 'en';
      const text = encodeURIComponent(q);
      const url = `${translationUrl}?q=${text}&langpair=${sourceCode}|${targetCode}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('[ERROR] MyMemory API failed:', response.status);
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'Translation service error' }),
        };
      }

      const data = await response.json();
      const translatedText = data?.responseData?.translatedText || q;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ translatedText }),
      };
    }

    // LibreTranslate uses POST with JSON body
    const response = await fetch(translationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q,
        source: source || 'ro',
        target,
        format: 'text',
      }),
    });

    if (!response.ok) {
      console.error('[ERROR] LibreTranslate API failed:', response.status);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Translation service error' }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[ERROR] Translation function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
