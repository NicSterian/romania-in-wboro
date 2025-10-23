import { createClient } from 'contentful';
import { translateText, translateRichText } from './translate';

// IMPORTANT: Never hardcode credentials here - always use environment variables
const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID || '',
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN || '',
});

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
  content: any;
  contentEn: any;
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
    featuredImageUrl: item.fields.featuredImageUrl,
    excerpt: item.fields.excerpt,
    excerptEn,
    content: item.fields.content,
    contentEn,
    additionalImages: item.fields.additionalImages || [],
    facebookLink: item.fields.facebookLink,
    published: item.fields.published,
  };
}

async function autoTranslateGalleryAlbum(item: any): Promise<GalleryAlbum> {
  const albumTitleEn = item.fields.albumTitleEn || await translateText(item.fields.albumTitle);
  const descriptionEn = item.fields.description 
    ? (item.fields.descriptionEn || await translateText(item.fields.description))
    : undefined;
  
  return {
    id: item.sys.id,
    albumTitle: item.fields.albumTitle,
    albumTitleEn,
    category: item.fields.category,
    coverImageUrl: item.fields.coverImageUrl,
    images: item.fields.images || [],
    description: item.fields.description,
    descriptionEn,
    date: item.fields.date,
    published: item.fields.published,
  };
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  try {
    const response = await client.getEntries({
      content_type: 'newsPost',
      'fields.published': true,
      order: ['-fields.publicationDate'],
    });

    return await Promise.all(
      response.items.map(autoTranslateNewsPost)
    );
  } catch (error) {
    console.error('Error fetching news posts:', error);
    return [];
  }
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const response = await client.getEntries({
      content_type: 'newsPost',
      'fields.slug': slug,
      'fields.published': true,
      limit: 1,
    });

    if (response.items.length === 0) return null;

    return await autoTranslateNewsPost(response.items[0]);
  } catch (error) {
    console.error('Error fetching news post:', error);
    return null;
  }
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  try {
    const response = await client.getEntries({
      content_type: 'galleryAlbum',
      'fields.published': true,
      order: ['-fields.date'],
    });

    return await Promise.all(
      response.items.map(autoTranslateGalleryAlbum)
    );
  } catch (error) {
    console.error('Error fetching gallery albums:', error);
    return [];
  }
}
