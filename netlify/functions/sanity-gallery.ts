import { Handler } from '@netlify/functions';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Sanity client
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

function urlFor(source: any) {
  return builder.image(source);
}

type GalleryAlbum = {
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

function mapGalleryAlbum(item: any, lang: string): GalleryAlbum {
  // Extract Romanian content
  const titleRo = item.titleRo || '';
  const descriptionRo = item.descriptionRo || '';

  // Extract English content
  const titleEn = item.titleEn || '';
  const descriptionEn = item.descriptionEn || '';

  // Determine display values based on language
  const displayTitle = lang === 'ro'
    ? titleRo || titleEn
    : titleEn || titleRo;

  const displayDescription = lang === 'ro'
    ? descriptionRo || descriptionEn
    : descriptionEn || descriptionRo;

  // Process cover image
  const coverImageUrl = item.coverImage
    ? urlFor(item.coverImage).width(800).url()
    : '/gallery-placeholder.jpg';

  // Process images
  const images = (item.images || []).map((img: any) => ({
    url: urlFor(img).width(1200).url(),
    alt: img.alt || '',
    caption: img.caption || '',
  }));

  return {
    id: item._id,
    title: displayTitle,
    titleEn: titleEn,
    slug: item.slug?.current || '',
    category: item.category || '',
    eventDate: item.eventDate || '',
    coverImageUrl,
    description: displayDescription,
    descriptionEn: descriptionEn,
    images,
    published: item.published || false,
    originalTitleRo: titleRo,
    originalDescriptionRo: descriptionRo,
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';

  if (!projectId) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Sanity credentials not configured' }),
    };
  }

  const lang = event.queryStringParameters?.lang || 'en';
  const slug = event.path.split('/').pop();

  try {
    // If path has a slug (not just /api/gallery), fetch single published (non-draft) album
    if (slug && slug !== 'gallery' && !event.path.endsWith('/api/gallery')) {
      const query = `*[_type == "galleryAlbum" && slug.current == $slug && published == true && !(_id in path("drafts.**"))][0]{
        _id,
        titleRo,
        titleEn,
        slug,
        category,
        eventDate,
        coverImage,
        descriptionRo,
        descriptionEn,
        images,
        published
      }`;

      const album = await sanityClient.fetch(query, { slug });

      if (!album) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Album not found' }),
        };
      }

      const mappedAlbum = mapGalleryAlbum(album, lang);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedAlbum),
      };
    }

    // Fetch all published (non-draft) albums
    const query = `*[_type == "galleryAlbum" && published == true && !(_id in path("drafts.**"))] | order(eventDate desc){
      _id,
      titleRo,
      titleEn,
      slug,
      category,
      eventDate,
      coverImage,
      descriptionRo,
      descriptionEn,
      images,
      published
    }`;

    const albums = await sanityClient.fetch(query);
    const mappedAlbums = albums.map((album: any) => mapGalleryAlbum(album, lang));

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedAlbums),
    };
  } catch (error) {
    console.error('Sanity API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch gallery albums' }),
    };
  }
};
