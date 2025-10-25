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
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery albums:', error);
    return [];
  }
}
