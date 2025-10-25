import type { Document } from '@contentful/rich-text-types';
import { BLOCKS } from '@contentful/rich-text-types';

// Simple cache using localStorage
function getCache(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setCache(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore cache errors
  }
}

// Get translation API endpoint
function getTranslationEndpoint(): string {
  return '/api/translate';
}

export async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === '') return text;

  const cacheKey = `translate:${text}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = getTranslationEndpoint();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'ro',
        target: 'en',
      }),
    });

    if (!response.ok) {
      console.warn('Translation service unavailable, returning original text');
      return text;
    }

    const data = await response.json();
    const translated = data.translatedText || text;
    
    setCache(cacheKey, translated);
    return translated;
  } catch (error) {
    console.warn('Translation error, returning original text');
    return text;
  }
}

export async function translateRichText(richTextContent: Document | undefined): Promise<Document> {
  if (!richTextContent) {
    return {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };
  }

  async function translateNode(node: any): Promise<any> {
    if (node.nodeType === 'text' && node.value) {
      return {
        ...node,
        value: await translateText(node.value),
      };
    }

    if (node.content && Array.isArray(node.content)) {
      return {
        ...node,
        content: await Promise.all(node.content.map(translateNode)),
      };
    }

    return node;
  }

  return await translateNode(richTextContent);
}
