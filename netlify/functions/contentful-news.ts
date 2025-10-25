import { Handler } from '@netlify/functions';
import { createClient } from 'contentful';
import type { Entry } from 'contentful';
import type { Document } from '@contentful/rich-text-types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ContentfulAsset = {
  fields?: {
    file?: {
      url?: string;
      [locale: string]: unknown;
    };
  };
};

type ImageValue = string | ContentfulAsset;
type ImageField = ImageValue | ImageValue[];

function isAssetFile(value: unknown): value is { url?: string } {
  return typeof value === 'object' && value !== null && 'url' in value;
}

// Given a field that may be a localized map (from locale:'*'), return best value.
function pickLocalized<T = string>(value: unknown, prefs: string[]): T | undefined {
  if (value == null) return undefined;

  // If already a scalar (because locale!='*'), return as is
  if (typeof value !== 'object' || Array.isArray(value)) return value as T;

  const map = value as Record<string, unknown>;

  for (const l of prefs) {
    const candidate = map[l];
    if (candidate !== undefined && candidate !== null) return candidate as T;
  }
  // Fallback to any available
  const first = Object.values(map).find((entry) => Boolean(entry));
  return first as T | undefined;
}

// Prefer chain builders
const EN_PREFS = ['en-GB', 'en-US', 'ro-RO'];
const RO_PREFS = ['ro-RO', 'en-GB', 'en-US'];

// Convenience for strings & rich text
const pickEn = <T,>(v: unknown) => pickLocalized<T>(v, EN_PREFS);
const pickRo = <T,>(v: unknown) => pickLocalized<T>(v, RO_PREFS);

type ContentfulNewsFields = {
  title?: unknown;
  titleEn?: string;
  slug?: unknown;
  category?: unknown;
  publicationDate?: unknown;
  featuredImage?: ImageField;
  featuredImageUrl?: ImageField;
  excerpt?: unknown;
  excerptEn?: string;
  content?: unknown;
  contentEn?: Document;
  additionalImages?: ImageField;
  facebookLink?: unknown;
  published?: unknown;
};

type NewsPost = {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  category: string;
  publicationDate: string;
  featuredImageUrl: string;
  excerpt: string;
  excerptEn: string;
  content: Document;
  contentEn: Document;
  additionalImages?: string[];
  facebookLink?: string;
  published: boolean;
};

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

  const assetFields = (imageField as ContentfulAsset).fields;
  if (assetFields?.file) {
    const fileField = assetFields.file;

    if (isAssetFile(fileField) && typeof fileField.url === 'string') {
      const normalized = fileField.url.startsWith('//') ? `https:${fileField.url}` : fileField.url;
      return transformExternalImageUrl(normalized);
    }

    if (typeof fileField === 'object' && fileField !== null) {
      const localizedFiles = fileField as Record<string, unknown>;
      for (const locale of Object.keys(localizedFiles)) {
        const localeFile = localizedFiles[locale];
        if (isAssetFile(localeFile) && typeof localeFile.url === 'string') {
          const normalized =
            localeFile.url.startsWith('//') ? `https:${localeFile.url}` : localeFile.url;
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

async function autoTranslateNewsPost(
  item: Entry<ContentfulNewsFields>,
  lang: string
): Promise<NewsPost> {
  const f = item.fields as ContentfulNewsFields;
  const emptyDoc: Document = { nodeType: 'document', data: {}, content: [] };

  // Resolve base (RO & EN candidates)
  const roTitle = pickRo<string>(f.title) || '';
  const enTitle = pickEn<string>(f.title);

  const roExcerpt = pickRo<string>(f.excerpt) || '';
  const enExcerpt = pickEn<string>(f.excerpt);

  const roContent = pickRo<Document>(f.content) || emptyDoc;
  const enContent = pickEn<Document>(f.content);

  // Compute display fields per UI language
  let title = roTitle;
  let excerpt = roExcerpt;
  let content = roContent;

  if (lang === 'en') {
    // Prefer localized EN; if missing, machine-translate from RO
    title = enTitle ?? (roTitle ? await translateText(roTitle) : '');
    excerpt = enExcerpt ?? (roExcerpt ? await translateText(roExcerpt) : '');
    content = enContent ?? (await translateRichText(roContent));
  }

  // Legacy *En fields (keep as secondary fallbacks)
  const legacyTitleEn = f.titleEn as string | undefined;
  const legacyExcerptEn = f.excerptEn as string | undefined;
  const legacyContentEn = f.contentEn as Document | undefined;

  if (lang === 'en') {
    if (!title && legacyTitleEn) title = legacyTitleEn;
    if (!excerpt && legacyExcerptEn) excerpt = legacyExcerptEn;
    if (!enContent && legacyContentEn) content = legacyContentEn;
  }

  // Images (try any locale and normalize)
  const featured =
    resolveFirstImageUrl(f.featuredImage, f.featuredImageUrl) || '/news-placeholder.jpg';
  const additional = normalizeImageArray(f.additionalImages);

  const slug =
    pickRo<string>(f.slug) ?? pickEn<string>(f.slug) ?? (typeof f.slug === 'string' ? f.slug : '');
  const category =
    pickRo<string>(f.category) ??
    pickEn<string>(f.category) ??
    (typeof f.category === 'string' ? f.category : '');
  const publicationDate =
    pickRo<string>(f.publicationDate) ??
    pickEn<string>(f.publicationDate) ??
    (typeof f.publicationDate === 'string' ? f.publicationDate : '');
  const facebookLink =
    pickRo<string>(f.facebookLink) ??
    pickEn<string>(f.facebookLink) ??
    (typeof f.facebookLink === 'string' ? f.facebookLink : undefined);
  const published = pickLocalized<boolean>(f.published, RO_PREFS);
  const fallbackPublished =
    typeof f.published === 'object' && f.published !== null
      ? Object.values(f.published).some(Boolean)
      : Boolean(f.published);

  return {
    id: item.sys.id,
    title,
    titleEn: legacyTitleEn || enTitle || '',
    slug,
    category,
    publicationDate,
    featuredImageUrl: featured,
    excerpt,
    excerptEn: legacyExcerptEn || enExcerpt || '',
    content,
    contentEn: legacyContentEn || enContent || emptyDoc,
    additionalImages: additional,
    facebookLink,
    published: typeof published === 'boolean' ? published : fallbackPublished,
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
        locale: '*',
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
      locale: '*',
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
