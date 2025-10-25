import { Handler } from '@netlify/functions';
import { createClient } from 'contentful';
import type { Entry } from 'contentful';

const EN_PREFS = ['en-GB', 'en-US', 'ro-RO'];
const RO_PREFS = ['ro-RO', 'en-GB', 'en-US'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

function pickLocalized<T = string>(value: unknown, prefs: string[]): T | undefined {
  if (value == null) return undefined;

  if (typeof value !== 'object' || Array.isArray(value)) return value as T;

  const map = value as Record<string, unknown>;

  for (const locale of prefs) {
    const candidate = map[locale];
    if (candidate !== undefined && candidate !== null) {
      return candidate as T;
    }
  }

  const first = Object.values(map).find((entry) => Boolean(entry));
  return first as T | undefined;
}

const pickEn = <T,>(v: unknown) => pickLocalized<T>(v, EN_PREFS);
const pickRo = <T,>(v: unknown) => pickLocalized<T>(v, RO_PREFS);

async function mapGalleryAlbum(item: Entry<any>, lang: string): Promise<any> {
  const fields = item.fields as any;

  const roTitle = pickRo<string>(fields.albumTitle) || '';
  const enTitle = pickEn<string>(fields.albumTitle);
  const legacyTitleEn = typeof fields.albumTitleEn === 'string' ? fields.albumTitleEn : undefined;

  const roDescription = pickRo<string>(fields.description) || '';
  const enDescription = pickEn<string>(fields.description);
  const legacyDescriptionEn = typeof fields.descriptionEn === 'string' ? fields.descriptionEn : undefined;

  const albumTitle = lang === 'ro'
    ? roTitle || enTitle || legacyTitleEn || ''
    : enTitle || legacyTitleEn || roTitle || '';

  const albumTitleEn = enTitle || legacyTitleEn || '';

  const description = lang === 'ro'
    ? roDescription || enDescription || legacyDescriptionEn || undefined
    : enDescription || legacyDescriptionEn || roDescription || undefined;

  const descriptionEn = enDescription || legacyDescriptionEn || '';

  return {
    id: item.sys.id,
    albumTitle,
    albumTitleEn,
    category:
      pickRo<string>(fields.category) ||
      pickEn<string>(fields.category) ||
      (typeof fields.category === 'string' ? fields.category : ''),
    coverImageUrl:
      resolveFirstImageUrl(fields.coverImage, fields.coverImageUrl) ||
      '/news-placeholder.jpg',
    images: normalizeImageArray(fields.images),
    description,
    descriptionEn,
    date:
      pickRo<string>(fields.date) ||
      pickEn<string>(fields.date) ||
      (typeof fields.date === 'string' ? fields.date : undefined),
    published:
      typeof fields.published === 'boolean'
        ? fields.published
        : Boolean(fields.published),
    originalAlbumTitleRo: roTitle || undefined,
    originalDescriptionRo: roDescription || undefined,
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const galleryContentType = process.env.CONTENTFUL_GALLERY_CONTENT_TYPE || 'galleryAlbum';

  if (!spaceId || !accessToken) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Contentful credentials not configured' }),
    };
  }

  const client = createClient({ space: spaceId, accessToken });
  const lang = event.queryStringParameters?.lang || 'en';

  try {
    const response = await client.getEntries({
      content_type: galleryContentType,
      'fields.published': true,
      order: ['-fields.date'],
      locale: '*',
      include: 2,
    });

    const albums = await Promise.all(
      response.items.map((item) => mapGalleryAlbum(item, lang))
    );

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(albums),
    };
  } catch (error) {
    console.error('Contentful API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch gallery albums' }),
    };
  }
};
