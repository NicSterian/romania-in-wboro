import type { Document } from '@contentful/rich-text-types';

export type NewsPost = {
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
};

export type GalleryAlbum = {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  category: string;
  eventDate: string;
  coverImageUrl: string;
  description: string;
  descriptionEn: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  published: boolean;
  originalTitleRo?: string;
  originalDescriptionRo?: string;
};

// Fetch news posts from API
export async function getNewsPosts(lang: 'ro' | 'en' = 'ro'): Promise<NewsPost[]> {
  try {
    const response = await fetch(`/api/news?lang=${lang}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch news posts: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news posts:', error);
    throw error;
  }
}

// Fetch single news post by slug
export async function getNewsPost(slug: string, lang: 'ro' | 'en' = 'ro'): Promise<NewsPost> {
  try {
    const response = await fetch(`/api/news/${slug}?lang=${lang}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch news post: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news post:', error);
    throw error;
  }
}

// Fetch gallery albums from API
export async function getGalleryAlbums(lang: 'ro' | 'en' = 'ro'): Promise<GalleryAlbum[]> {
  try {
    const response = await fetch(`/api/gallery?lang=${lang}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery albums: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching gallery albums:', error);
    throw error;
  }
}

// Fetch single gallery album by slug
export async function getGalleryAlbum(slug: string, lang: 'ro' | 'en' = 'ro'): Promise<GalleryAlbum> {
  try {
    const response = await fetch(`/api/gallery/${slug}?lang=${lang}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery album: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching gallery album:', error);
    throw error;
  }
}
