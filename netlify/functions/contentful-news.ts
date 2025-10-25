import { Handler } from '@netlify/functions';
import { createClient } from 'contentful';
import type { Entry } from 'contentful';
import type { Document } from '@contentful/rich-text-types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map UI language to Contentful locale
const cfLocaleFor = (lang: string): string => {
  return lang === 'ro' ? 'ro-RO' : 'en-GB';
};

type ContentfulAsset = {
  fields?: {
    file?: {
      url?: string;
      [locale: string]: any;
    };
  };
};

type ImageValue = string | ContentfulAsset;
type ImageField = ImageValue | ImageValue[];

function transformExternalImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes('drive.google.com')) {
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
      const idParam = parsed.searchParams.get('id');
      if (idParam) {
        return `https://drive.google.com/uc?export=view&id=${idParam}`;
      }
    }

    if (parsed.hostname.includes('googleusercontent.com')) {
      return trimmed;
    }

    if (parsed.hostname.includes('ctfassets.net') || parsed.hostname.includes('contentful.com')) {
      return trimmed;
    }

    if (parsed.hostname.includes('photos.google.com') || parsed.hostname.includes('photos.app.goo.gl')) {
      return '';
    }
  } catch {
    // Invalid URL
  }

  return trimmed;
}

function resolveImageUrl(imageField: ImageField | undefined): string | undefined {
  if (!imageField) return undefined;

  if (typeof imageField === 'string') {
    return transformExternalImageUrl(imageField);
  }

  if (Array.isArray(imageField)) {
    const firstUrl = imageField
      .map((item) => resolveImageUrl(item))
      .find((url): url is string => Boolean(url));
    return firstUrl;
  }

  const assetFields = (imageField as any).fields;
  if (assetFields?.file) {
    const fileField = assetFields.file;
    
    if (typeof fileField.url === 'string') {
      const normalized = fileField.url.startsWith('//') ? `https:${fileField.url}` : fileField.url;
      return transformExternalImageUrl(normalized);
    }
    
    if (typeof fileField === 'object') {
      for (const locale in fileField) {
        const localeFile = fileField[locale];
        if (localeFile?.url) {
          const normalized = localeFile.url.startsWith('//') ? `https:${localeFile.url}` : localeFile.url;
          return transformExternalImageUrl(normalized);
        }
      }
    }
  }

  return undefined;
}

function expandImageField(imageField: ImageField | undefined): ImageValue[] {
  if (!imageField) return [];

  if (Array.isArray(imageField)) {
    return imageField.flatMap((item) => expandImageField(item));
  }

  if (typeof imageField === 'string') {
    const trimmed = imageField.trim();
    if (!trimmed) return [];

    const separated = trimmed
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (separated.length > 1) {
      return Array.from(new Set(separated));
    }

    return [trimmed];
  }

  return [imageField];
}

function normalizeImageArray(images: ImageField | undefined): string[] {
  return expandImageField(images)
    .map((image) => resolveImageUrl(image))
    .filter((url): url is string => Boolean(url));
}

function resolveFirstImageUrl(...imageFields: (ImageField | undefined)[]): string | undefined {
  for (const field of imageFields) {
    const urls = normalizeImageArray(field);
    if (urls.length > 0) {
      return urls[0];
    }
  }
  return undefined;
}

// Helper to call internal translate API
async function translateText(text: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.URL || 'http://localhost:8888'}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from: 'ro', to: 'en' }),
    });
    if (!response.ok) return text;
    const data = await response.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
}

async function translateRichText(content: Document): Promise<Document> {
  // Simple implementation - in production you'd recursively translate text nodes
  return content;
}

async function autoTranslateNewsPost(item: Entry<any>, lang: string): Promise<any> {
  const fields = item.fields as any;
  
  let title: string;
  let excerpt: string;
  let content: Document;
  let titleEn: string;
  let excerptEn: string;
  let contentEn: Document;

  if (lang === 'en') {
    title = fields.title || '';
    titleEn = fields.title || fields.titleEn || (fields.title ? await translateText(fields.title) : '');
    
    excerpt = fields.excerpt || '';
    excerptEn = fields.excerpt || fields.excerptEn || (fields.excerpt ? await translateText(fields.excerpt) : '');
    
    content = fields.content || { nodeType: 'document', data: {}, content: [] };
    contentEn = fields.content || fields.contentEn || (fields.content ? await translateRichText(fields.content) : { nodeType: 'document', data: {}, content: [] });
  } else {
    title = fields.title || '';
    titleEn = fields.titleEn || (fields.title ? await translateText(fields.title) : '');
    
    excerpt = fields.excerpt || '';
    excerptEn = fields.excerptEn || (fields.excerpt ? await translateText(fields.excerpt) : '');
    
    content = fields.content || { nodeType: 'document', data: {}, content: [] };
    contentEn = fields.contentEn || (fields.content ? await translateRichText(fields.content) : { nodeType: 'document', data: {}, content: [] });
  }

  return {
    id: item.sys.id,
    title,
    titleEn,
    slug: fields.slug,
    category: fields.category,
    publicationDate: fields.publicationDate,
    featuredImageUrl:
      resolveFirstImageUrl(fields.featuredImage, fields.featuredImageUrl) ||
      '/news-placeholder.jpg',
    excerpt,
    excerptEn,
    content,
    contentEn,
    additionalImages: normalizeImageArray(fields.additionalImages),
    facebookLink: fields.facebookLink,
    published: fields.published,
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const newsContentType = process.env.CONTENTFUL_NEWS_CONTENT_TYPE || 'newsPost';

  if (!spaceId || !accessToken) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Contentful credentials not configured' }),
    };
  }

  const client = createClient({ space: spaceId, accessToken });
  const lang = event.queryStringParameters?.lang || 'en';
  const slug = event.path.split('/').pop();

  try {
    // If path has a slug (not just /api/news), fetch single post
    if (slug && slug !== 'news' && !event.path.endsWith('/api/news')) {
      const response = await client.getEntries({
        content_type: newsContentType,
        'fields.slug': slug,
        'fields.published': true,
        limit: 1,
        locale: cfLocaleFor(lang),
        include: 2,
      });

      if (response.items.length === 0) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Post not found' }),
        };
      }

      const post = await autoTranslateNewsPost(response.items[0], lang);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      };
    }

    // Fetch all posts
    const response = await client.getEntries({
      content_type: newsContentType,
      'fields.published': true,
      order: ['-fields.publicationDate'],
      locale: cfLocaleFor(lang),
      include: 2,
    });

    const posts = await Promise.all(
      response.items.map((item) => autoTranslateNewsPost(item, lang))
    );

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(posts),
    };
  } catch (error) {
    console.error('Contentful API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch news posts' }),
    };
  }
};
