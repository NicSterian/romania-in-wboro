import { createClient } from 'contentful';
import type { Entry } from 'contentful';
import type { Document } from '@contentful/rich-text-types';
import { translateText, translateRichText } from './translate';

type ContentfulAsset = {
  fields?: {
    file?: {
      url?: string;
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
      // Convert /file/d/FILE_ID/view to direct download URL
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
      // Also handle uc?id= format
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

interface NewsPostFields {
  title: string;
  titleEn?: string;
  slug: string;
  category: string;
  publicationDate: string;
  featuredImage?: ImageField;
  featuredImageUrl?: string;
  excerpt: string;
  excerptEn?: string;
  content: Document;
  contentEn?: Document;
  additionalImages?: ImageField;
  facebookLink?: string;
  published: boolean;
}

interface GalleryAlbumFields {
  albumTitle: string;
  albumTitleEn?: string;
  category: string;
  coverImage?: ImageField;
  coverImageUrl?: string;
  images?: ImageField;
  description?: string;
  descriptionEn?: string;
  date?: string;
  published: boolean;
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

  const assetUrl = imageField.fields?.file?.url || imageField.url;
  if (!assetUrl) return undefined;

  const normalized = assetUrl.startsWith('//') ? `https:${assetUrl}` : assetUrl;
  return transformExternalImageUrl(normalized);
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
async function autoTranslateNewsPost(item: any): Promise<NewsPost> {
  const fields = item.fields;
  
  // Use existing English translation if available, otherwise auto-translate from Romanian
  const titleEn = fields.titleEn || await translateText(fields.title);
  const excerptEn = fields.excerptEn || await translateText(fields.excerpt);
  const contentEn = fields.contentEn || await translateRichText(fields.content);

  return {
    id: item.sys.id,
    title: fields.title,
    titleEn,
    slug: fields.slug,
    category: fields.category,
    publicationDate: fields.publicationDate,
    featuredImageUrl:
      resolveFirstImageUrl(fields.featuredImage, fields.featuredImageUrl) ||
      '',
    excerpt: fields.excerpt,
    excerptEn,
    content: fields.content,
    contentEn,
    additionalImages: normalizeImageArray(fields.additionalImages),
    facebookLink: fields.facebookLink,
    published: fields.published,
  };
}

async function autoTranslateGalleryAlbum(item: any): Promise<GalleryAlbum> {
  const fields = item.fields;
  
  const albumTitleEn = fields.albumTitleEn || await translateText(fields.albumTitle);
  const descriptionEn = fields.description
    ? (fields.descriptionEn || await translateText(fields.description))
    : undefined;

  return {
    id: item.sys.id,
    albumTitle: fields.albumTitle,
    albumTitleEn,
    category: fields.category,
    coverImageUrl:
      resolveFirstImageUrl(fields.coverImage, fields.coverImageUrl) ||
      '',
    images: normalizeImageArray(fields.images),
    description: fields.description,
    descriptionEn,
    date: fields.date,
    published: fields.published,
  };
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  if (!client) {
    console.warn('Contentful credentials not configured');
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: newsContentType,
      'fields.published': true,
      order: ['-fields.publicationDate'],
    });

    return await Promise.all(
      response.items.map(autoTranslateNewsPost)
    );
  } catch (error) {
    logContentfulError('Error fetching news posts', error);
    return [];
  }
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
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
    });

    if (response.items.length === 0) return null;

    return await autoTranslateNewsPost(response.items[0]);
  } catch (error) {
    logContentfulError('Error fetching news post', error);
    return null;
  }
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (!client) {
    console.warn('Contentful credentials not configured');
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: galleryContentType,
      'fields.published': true,
      order: ['-fields.date'],
    });

    return await Promise.all(
      response.items.map(autoTranslateGalleryAlbum)
    );
  } catch (error) {
    logContentfulError('Error fetching gallery albums', error);
    return [];
  }
}
