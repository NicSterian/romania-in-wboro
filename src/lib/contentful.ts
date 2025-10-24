import { createClient, type Entry } from 'contentful';
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

    if (parsed.hostname.includes('drive.google.com')) {
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }

    if (parsed.hostname.includes('googleusercontent.com')) {
      return trimmed;
    }

    if (parsed.hostname.includes('photos.google.com')) {
      const photoId = parsed.pathname.split('/photo/')[1]?.split('?')[0];
      if (photoId) {
        return `https://lh3.googleusercontent.com/${photoId}=w2048`;
      }
    }
  } catch (error) {
    console.warn('Could not normalize external image URL:', error);
  }

  return trimmed;
}

type NewsPostFields = {
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
};

type GalleryAlbumFields = {
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
};

function resolveImageUrl(imageField: ImageValue | undefined): string | undefined {
  if (!imageField) return undefined;

  if (typeof imageField === 'string') {
    return transformExternalImageUrl(imageField);
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

function resolveFirstImageUrl(imageField: ImageField | undefined): string | undefined {
  const [first] = expandImageField(imageField);
  return resolveImageUrl(first);
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

type NewsPostResult = {
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

type GalleryAlbumResult = {
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
};

export type NewsPost = NewsPostResult;
export type GalleryAlbum = GalleryAlbumResult;

// Auto-translate Romanian content to English if English fields are empty
async function autoTranslateNewsPost(item: Entry<NewsPostFields>): Promise<NewsPostResult> {
  // Use existing English translation if available, otherwise auto-translate from Romanian
  const titleEn = item.fields.titleEn || await translateText(item.fields.title);
  const excerptEn = item.fields.excerptEn || await translateText(item.fields.excerpt);
  const contentEn = item.fields.contentEn || await translateRichText(item.fields.content);
  
  return {
    id: item.sys.id,
    title: item.fields.title,
    titleEn,
    slug: item.fields.slug,
    category: item.fields.category,
    publicationDate: item.fields.publicationDate,
    featuredImageUrl:
      resolveFirstImageUrl(item.fields.featuredImage) ||
      resolveFirstImageUrl(item.fields.featuredImageUrl) ||
      '',
    excerpt: item.fields.excerpt,
    excerptEn,
    content: item.fields.content,
    contentEn,
    additionalImages: normalizeImageArray(item.fields.additionalImages),
    facebookLink: item.fields.facebookLink,
    published: item.fields.published,
  };
}

async function autoTranslateGalleryAlbum(item: Entry<GalleryAlbumFields>): Promise<GalleryAlbumResult> {
  const albumTitleEn = item.fields.albumTitleEn || await translateText(item.fields.albumTitle);
  const descriptionEn = item.fields.description 
    ? (item.fields.descriptionEn || await translateText(item.fields.description))
    : undefined;
  
  return {
    id: item.sys.id,
    albumTitle: item.fields.albumTitle,
    albumTitleEn,
    category: item.fields.category,
    coverImageUrl:
      resolveFirstImageUrl(item.fields.coverImage) ||
      resolveFirstImageUrl(item.fields.coverImageUrl) ||
      '',
    images: normalizeImageArray(item.fields.images),
    description: item.fields.description,
    descriptionEn,
    date: item.fields.date,
    published: item.fields.published,
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
