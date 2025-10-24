import type { Document, RichTextContent, Text as RichTextText } from '@contentful/rich-text-types';

function getCache(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('Unable to access localStorage for translation cache:', error);
    return null;
  }
}

function setCache(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Unable to save translation to cache:', error);
  }
}

function getTranslationEndpoints(): string[] {
  const configured = import.meta.env.VITE_TRANSLATION_API_URL;

  const defaults = [
    'https://translate.argosopentech.com/translate',
    'https://libretranslate.de/translate',
    'https://libretranslate.com/translate',
  ];

  const endpoints = configured
    ? [configured, ...defaults.filter((url) => url !== configured)]
    : defaults;

  return [...new Set(endpoints)];
}

export async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === '') return text;

  const cacheKey = `translation_${text.substring(0, 50)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const endpoints = getTranslationEndpoints();
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'ro',
          target: 'en',
          format: 'text',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const translated = data.translatedText;

      if (typeof translated === 'string' && translated.trim() !== '') {
        setCache(cacheKey, translated);
        return translated;
      }

      throw new Error('Translation API returned empty response');
    } catch (error) {
      lastError = error;
      console.error('Translation error:', error);
      continue;
    }
  }

  if (lastError) {
    console.error('All translation endpoints failed, returning original text');
  }

  return text;
}

export async function translateRichText(richTextContent: Document | undefined): Promise<Document> {
  if (!richTextContent) {
    return {
      nodeType: 'document',
      data: {},
      content: [],
    };
  }

  const translateNode = async (node: RichTextContent): Promise<RichTextContent> => {
    if (node.nodeType === 'text') {
      const textNode = node as RichTextText;
      return {
        ...textNode,
        value: await translateText(textNode.value),
      };
    }

    if ('content' in node && Array.isArray(node.content)) {
      return {
        ...node,
        content: await Promise.all(node.content.map(translateNode)),
      } as RichTextContent;
    }

    return node;
  };

  return {
    ...richTextContent,
    content: await Promise.all(richTextContent.content.map(translateNode)),
  };
}
