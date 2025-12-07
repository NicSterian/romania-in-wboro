import { Handler } from '@netlify/functions';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { Document } from '@contentful/rich-text-types';
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Sanity client
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Use CDN for better performance in production
  token: process.env.SANITY_API_TOKEN, // Read token for fetching published content
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

function urlFor(source: any) {
  return builder.image(source);
}

// Convert Sanity Portable Text to Contentful Rich Text format
function portableTextToRichText(blocks: any[]): Document {
  if (!blocks || !Array.isArray(blocks)) {
    return {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };
  }

  const content = blocks.map((block) => {
    // Handle text blocks
    if (block._type === 'block') {
      let nodeType: string;

      switch (block.style) {
        case 'h2':
          nodeType = BLOCKS.HEADING_2;
          break;
        case 'h3':
          nodeType = BLOCKS.HEADING_3;
          break;
        case 'blockquote':
          nodeType = BLOCKS.QUOTE;
          break;
        default:
          nodeType = BLOCKS.PARAGRAPH;
      }

      // Process children (spans)
      const children = (block.children || []).map((child: any) => {
        if (child._type === 'span') {
          let textNode: any = {
            nodeType: 'text',
            value: child.text || '',
            marks: [],
            data: {},
          };

          // Handle marks (bold, italic, etc.)
          if (child.marks && Array.isArray(child.marks)) {
            textNode.marks = child.marks.map((mark: string) => {
              if (mark === 'strong') return { type: MARKS.BOLD };
              if (mark === 'em') return { type: MARKS.ITALIC };
              if (mark === 'underline') return { type: MARKS.UNDERLINE };
              if (mark === 'code') return { type: MARKS.CODE };
              return { type: mark };
            });
          }

          return textNode;
        }
        return {
          nodeType: 'text',
          value: '',
          marks: [],
          data: {},
        };
      });

      return {
        nodeType: nodeType,
        data: {},
        content: children,
      };
    }

    // Handle images
    if (block._type === 'image') {
      return {
        nodeType: BLOCKS.EMBEDDED_ASSET,
        data: {
          target: {
            fields: {
              file: {
                url: urlFor(block).url(),
              },
              title: block.alt || '',
              description: block.caption || '',
            },
          },
        },
        content: [],
      };
    }

    // Fallback for unknown types
    return {
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [{
        nodeType: 'text',
        value: '',
        marks: [],
        data: {},
      }],
    };
  });

  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content,
  };
}

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
  originalTitleRo?: string;
  originalExcerptRo?: string;
  originalContentRo?: Document;
};

function mapNewsPost(item: any, lang: string): NewsPost {
  const emptyDoc: Document = { nodeType: BLOCKS.DOCUMENT, data: {}, content: [] };

  // Extract Romanian content
  const titleRo = item.titleRo || '';
  const excerptRo = item.excerptRo || '';
  const contentRo = item.contentRo ? portableTextToRichText(item.contentRo) : emptyDoc;

  // Extract English content
  const titleEn = item.titleEn || '';
  const excerptEn = item.excerptEn || '';
  const contentEn = item.contentEn ? portableTextToRichText(item.contentEn) : emptyDoc;

  // Determine display values based on language
  const displayTitle = lang === 'ro'
    ? titleRo || titleEn
    : titleEn || titleRo;

  const displayExcerpt = lang === 'ro'
    ? excerptRo || excerptEn
    : excerptEn || excerptRo;

  const displayContent = lang === 'ro'
    ? (contentRo.content.length > 0 ? contentRo : contentEn)
    : (contentEn.content.length > 0 ? contentEn : contentRo);

  // Process featured image
  const featuredImageUrl = item.featuredImage
    ? urlFor(item.featuredImage).width(800).url()
    : '/news-placeholder.jpg';

  // Process additional images
  const additionalImages = (item.additionalImages || []).map((img: any) =>
    urlFor(img).width(1200).url()
  );

  return {
    id: item._id,
    title: displayTitle,
    titleEn: titleEn,
    slug: item.slug?.current || '',
    category: item.category || '',
    publicationDate: item.publicationDate || '',
    featuredImageUrl,
    excerpt: displayExcerpt,
    excerptEn: excerptEn,
    content: displayContent,
    contentEn: contentEn.content.length > 0 ? contentEn : emptyDoc,
    additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
    facebookLink: item.facebookLink,
    published: item.published || false,
    originalTitleRo: titleRo,
    originalExcerptRo: excerptRo,
    originalContentRo: contentRo,
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
    // If path has a slug (not just /api/news), fetch single published (non-draft) post
    if (slug && slug !== 'news' && !event.path.endsWith('/api/news')) {
      const query = `*[_type == "newsPost" && slug.current == $slug && published == true && !(_id in path("drafts.**"))][0]{
        _id,
        titleRo,
        titleEn,
        slug,
        category,
        publicationDate,
        featuredImage,
        excerptRo,
        excerptEn,
        contentRo,
        contentEn,
        additionalImages,
        facebookLink,
        published
      }`;

      const post = await sanityClient.fetch(query, { slug });

      if (!post) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Post not found' }),
        };
      }

      const mappedPost = mapNewsPost(post, lang);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedPost),
      };
    }

    // Fetch all published (non-draft) posts
    const query = `*[_type == "newsPost" && published == true && !(_id in path("drafts.**"))] | order(publicationDate desc){
      _id,
      titleRo,
      titleEn,
      slug,
      category,
      publicationDate,
      featuredImage,
      excerptRo,
      excerptEn,
      contentRo,
      contentEn,
      additionalImages,
      facebookLink,
      published
    }`;

    const posts = await sanityClient.fetch(query);
    const mappedPosts = posts.map((post: any) => mapNewsPost(post, lang));

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedPosts),
    };
  } catch (error) {
    console.error('Sanity API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch news posts' }),
    };
  }
};
