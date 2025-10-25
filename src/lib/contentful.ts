import { createClient } from 'contentful';
import type { Asset, Entry } from 'contentful';
import type { Document } from '@contentful/rich-text-types';
import { translateText, translateRichText } from './translate';

// Map UI language to Contentful locale
export const cfLocaleFor = (lang: string): string => {
  return lang === 'ro' ? 'ro-RO' : 'en-GB';
};

type ContentfulAsset = {
  fields?: {
    file?: {
      url?: string;
      [locale: string]: any;
    };
  };
  url?: string;
};

type ImageValue = string | ContentfulAsset;
type ImageField = ImageValue | ImageValue[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function transformExternalImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    // Handle Google Drive share links
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

    // Handle Googleusercontent (already direct URLs)
    if (parsed.hostname.includes('googleusercontent.com')) {
      return trimmed;
    }

    // Handle Contentful assets
    if (parsed.hostname.includes('ctfassets.net') || parsed.hostname.includes('contentful.com')) {
      return trimmed;
    }

    // Google Photos URLs are not supported for direct embedding
    if (parsed.hostname.includes('photos.google.com') || parsed.hostname.includes('photos.app.goo.gl')) {
      console.warn(
        '⚠️ Google Photos links are not supported for direct embedding. ' +
        'Please upload to Contentful Assets or use Google Drive instead. ' +
        'See SETUP.md for instructions.'
      );
      return ''; // Return empty to show placeholder
    }
  } catch (error) {
    console.warn('Could not normalize external image URL:', error);
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

  // Handle Contentful Asset with localized file
  const assetFields = (imageField as any).fields;
  if (assetFields?.file) {
    const fileField = assetFields.file;
    
    // If file.url exists directly
    if (typeof fileField.url === 'string') {
      const normalized = fileField.url.startsWith('//') ? `https:${fileField.url}` : fileField.url;
      return transformExternalImageUrl(normalized);
    }
    
    // If file is an object keyed by locale
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
    if (!trimmed) {
      return [];
    }

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

function describeContentfulError(error: unknown): string | null {
  if (!isRecord(error)) return null;

  const sys = error['sys'];
  if (isRecord(sys) && typeof sys['id'] === 'string') {
    const id = sys['id'];
    if (id === 'UnknownContentType') {
      return 'Unknown Content Type – ensure VITE_CONTENTFUL_*_CONTENT_TYPE matches your model ID in Contentful.';
    }
    return `Contentful error ${id}`;
  }

  if (typeof error['message'] === 'string') {
    return error['message'];
  }

  return null;
}

function logContentfulError(context: string, error: unknown) {
  const helpfulMessage = describeContentfulError(error);
  if (helpfulMessage) {
    console.error(`${context}: ${helpfulMessage}`, error);
  } else {
    console.error(context, error);
  }
}

// Check if Contentful credentials are configured
const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const newsContentType = import.meta.env.VITE_CONTENTFUL_NEWS_CONTENT_TYPE || 'newsPost';
const galleryContentType = import.meta.env.VITE_CONTENTFUL_GALLERY_CONTENT_TYPE || 'galleryAlbum';

const hasCredentials = spaceId && accessToken;

// Only create client if credentials exist
const client = hasCredentials ? createClient({
  space: spaceId,
  accessToken: accessToken,
}) : null;

export interface NewsPost {
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
}

export interface GalleryAlbum {
  id: string;
  albumTitle: string;
  albumTitleEn: string;
  category: string;
  coverImageUrl: string;
  images: string[];
  description?: string;
  descriptionEn?: string;
  date?: string;
  published: boolean;
}

// Auto-translate Romanian content to English if English fields are empty
async function autoTranslateNewsPost(item: Entry<any>, lang: string): Promise<NewsPost> {
  const fields = item.fields as any;
  
  // For EN UI: try localized EN-GB → legacy *En → RO → translate
  // For RO UI: use localized RO
  let title: string;
  let excerpt: string;
  let content: Document;
  let titleEn: string;
  let excerptEn: string;
  let contentEn: Document;

  if (lang === 'en') {
    // EN UI priority: localized EN-GB → legacy → RO → translate
    title = fields.title || '';
    titleEn = fields.title || fields.titleEn || (fields.title ? await translateText(fields.title) : '');
    
    excerpt = fields.excerpt || '';
    excerptEn = fields.excerpt || fields.excerptEn || (fields.excerpt ? await translateText(fields.excerpt) : '');
    
    content = fields.content || { nodeType: 'document', data: {}, content: [] };
    contentEn = fields.content || fields.contentEn || (fields.content ? await translateRichText(fields.content) : { nodeType: 'document', data: {}, content: [] });
  } else {
    // RO UI: use localized RO
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

async function autoTranslateGalleryAlbum(item: Entry<any>, lang: string): Promise<GalleryAlbum> {
  const fields = item.fields as any;
  
  let albumTitle: string;
  let albumTitleEn: string;
  let description: string | undefined;
  let descriptionEn: string | undefined;

  if (lang === 'en') {
    albumTitle = fields.albumTitle || '';
    albumTitleEn = fields.albumTitle || fields.albumTitleEn || (fields.albumTitle ? await translateText(fields.albumTitle) : '');
    
    description = fields.description;
    descriptionEn = fields.description || fields.descriptionEn || (fields.description ? await translateText(fields.description) : undefined);
  } else {
    albumTitle = fields.albumTitle || '';
    albumTitleEn = fields.albumTitleEn || (fields.albumTitle ? await translateText(fields.albumTitle) : '');
    
    description = fields.description;
    descriptionEn = fields.descriptionEn || (fields.description ? await translateText(fields.description) : undefined);
  }

  return {
    id: item.sys.id,
    albumTitle,
    albumTitleEn,
    category: fields.category,
    coverImageUrl:
      resolveFirstImageUrl(fields.coverImage, fields.coverImageUrl) ||
      '/news-placeholder.jpg',
    images: normalizeImageArray(fields.images),
    description,
    descriptionEn,
    date: fields.date,
    published: fields.published,
  };
}

export async function getNewsPosts(lang: string = 'en'): Promise<NewsPost[]> {
  if (!client) {
    console.warn('Contentful credentials not configured');
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: newsContentType,
      'fields.published': true,
      order: ['-fields.publicationDate'],
      locale: cfLocaleFor(lang),
      include: 2,
    });

    return await Promise.all(
      response.items.map((item) => autoTranslateNewsPost(item, lang))
    );
  } catch (error) {
    logContentfulError('Error fetching news posts', error);
    return [];
  }
}

export async function getNewsPostBySlug(slug: string, lang: string = 'en'): Promise<NewsPost | null> {
  if (!client) {
    console.warn('Contentful credentials not configured');
    return null;
  }

  try {
    const response = await client.getEntries({
      content_type: newsContentType,
      'fields.slug': slug,
      'fields.published': true,
      limit: 1,
      locale: cfLocaleFor(lang),
      include: 2,
    });

    if (response.items.length === 0) return null;

    return await autoTranslateNewsPost(response.items[0], lang);
  } catch (error) {
    logContentfulError('Error fetching news post', error);
    return null;
  }
}

export async function getGalleryAlbums(lang: string = 'en'): Promise<GalleryAlbum[]> {
  if (!client) {
    console.warn('Contentful credentials not configured');
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: galleryContentType,
      'fields.published': true,
      order: ['-fields.date'],
      locale: cfLocaleFor(lang),
      include: 2,
    });

    return await Promise.all(
      response.items.map((item) => autoTranslateGalleryAlbum(item, lang))
    );
  } catch (error) {
    logContentfulError('Error fetching gallery albums', error);
    return [];
  }
}
