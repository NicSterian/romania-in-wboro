import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'Scoala Romaneasca Mihai Eminescu',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'c58hn16z',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('News Posts')
              .schemaType('newsPost')
              .child(S.documentTypeList('newsPost').title('News Posts')),
            S.listItem()
              .title('Gallery Albums')
              .schemaType('galleryAlbum')
              .child(S.documentTypeList('galleryAlbum').title('Gallery Albums')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
