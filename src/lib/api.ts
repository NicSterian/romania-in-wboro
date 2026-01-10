import type { Document } from '@contentful/rich-text-types';

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
  originalTitleRo?: string;
  originalExcerptRo?: string;
  originalContentRo?: Document;
}

export interface GalleryAlbum {
  id: string;
  albumTitle: string;
  albumTitleEn: string;
  slug: string;
  category: string;
  coverImageUrl: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  description?: string;
  descriptionEn?: string;
  date?: string;
  published: boolean;
  originalAlbumTitleRo?: string;
  originalDescriptionRo?: string;
}

const normalizeGalleryImages = (images: any): GalleryAlbum['images'] => {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => {
      if (!image) return null;
      if (typeof image === 'string') {
        return { url: image };
      }
      if (typeof image.url === 'string') {
        return { url: image.url, alt: image.alt, caption: image.caption };
      }
      if (typeof image.asset?.url === 'string') {
        return { url: image.asset.url, alt: image.alt, caption: image.caption };
      }
      return null;
    })
    .filter(Boolean) as GalleryAlbum['images'];
};

const normalizeGalleryAlbum = (item: any): GalleryAlbum => {
  const slug = typeof item?.slug === 'string' ? item.slug : item?.slug?.current || '';
  const coverImageUrl = typeof item?.coverImageUrl === 'string' && item.coverImageUrl
    ? item.coverImageUrl
    : (typeof item?.coverImage === 'string'
      ? item.coverImage
      : item?.coverImage?.url || '/gallery-placeholder.jpg');

  return {
    id: item?.id || item?._id || '',
    albumTitle: item?.albumTitle || item?.title || '',
    albumTitleEn: item?.albumTitleEn || item?.titleEn || '',
    slug,
    category: item?.category || '',
    coverImageUrl,
    images: normalizeGalleryImages(item?.images),
    description: item?.description || '',
    descriptionEn: item?.descriptionEn || '',
    date: item?.date || item?.eventDate || '',
    published: item?.published ?? false,
    originalAlbumTitleRo: item?.originalAlbumTitleRo || item?.originalTitleRo || '',
    originalDescriptionRo: item?.originalDescriptionRo || '',
  };
};

export async function getNewsPosts(lang: string = 'en'): Promise<NewsPost[]> {
  try {
    const response = await fetch(`/api/news?lang=${lang}`);
    if (!response.ok) {
      console.warn('Failed to fetch news posts');
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching news posts:', error);
    return [];
  }
}

export async function getNewsPostBySlug(slug: string, lang: string = 'en'): Promise<NewsPost | null> {
  try {
    const response = await fetch(`/api/news/${slug}?lang=${lang}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn('Failed to fetch news post');
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching news post:', error);
    return null;
  }
}

export async function getGalleryAlbums(lang: string = 'en'): Promise<GalleryAlbum[]> {
  try {
    const response = await fetch(`/api/gallery?lang=${lang}`);
    if (!response.ok) {
      console.warn('Failed to fetch gallery albums');
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeGalleryAlbum);
  } catch (error) {
    console.error('Error fetching gallery albums:', error);
    return [];
  }
}

export async function getGalleryAlbumBySlug(slug: string, lang: string = 'en'): Promise<GalleryAlbum | null> {
  try {
    const trimmedSlug = slug.trim();
    const encodedSlug = encodeURIComponent(trimmedSlug);
    const response = await fetch(`/api/gallery/${encodedSlug}?lang=${lang}`, { cache: 'no-store' });
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';

    if (response.ok) {
      if (contentType.includes('application/json')) {
        const raw = await response.text();
        const trimmed = raw.trim();
        if (trimmed && !trimmed.toLowerCase().startsWith('<!doctype') && !trimmed.toLowerCase().startsWith('<html')) {
          try {
            const data = JSON.parse(raw);
            if (data) {
              return normalizeGalleryAlbum(data);
            }
          } catch (error) {
            console.warn('Failed to parse gallery album JSON, falling back to list');
          }
        }
      }
    } else if (response.status !== 404 && response.status !== 304) {
      console.warn('Failed to fetch gallery album, falling back to list');
    }

    const albums = await getGalleryAlbums(lang);
    const match = albums.find((album) => album.slug.trim() === trimmedSlug);
    return match || null;
  } catch (error) {
    console.error('Error fetching gallery album:', error);
    return null;
  }
}
