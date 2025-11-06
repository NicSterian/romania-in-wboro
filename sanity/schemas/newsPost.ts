import { defineType, defineField } from 'sanity';
import { BookIcon } from '@sanity/icons';

export default defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  icon: BookIcon,
  fields: [
    // Slug (URL identifier)
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (e.g., "bun-venit-la-scoala")',
      options: {
        source: 'titleRo',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    // Romanian Content
    defineField({
      name: 'titleRo',
      title: 'Title (Romanian)',
      type: 'string',
      description: 'Romanian title',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'excerptRo',
      title: 'Excerpt (Romanian)',
      type: 'text',
      description: 'Short description in Romanian (max 150 characters)',
      rows: 3,
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'contentRo',
      title: 'Content (Romanian)',
      type: 'array',
      description: 'Full article content in Romanian',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // English Content
    defineField({
      name: 'titleEn',
      title: 'Title (English)',
      type: 'string',
      description: 'English title (leave empty to auto-translate)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'excerptEn',
      title: 'Excerpt (English)',
      type: 'text',
      description: 'Short description in English (leave empty to auto-translate)',
      rows: 3,
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'contentEn',
      title: 'Content (English)',
      type: 'array',
      description: 'Full article content in English (leave empty to auto-translate)',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),

    // Category
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Anunțuri (Announcements)', value: 'Anunțuri' },
          { title: 'Evenimente (Events)', value: 'Evenimente' },
          { title: 'Activități (Activities)', value: 'Activități' },
          { title: 'Sărbători (Holidays)', value: 'Sărbători' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    // Publication Date
    defineField({
      name: 'publicationDate',
      title: 'Publication Date',
      type: 'datetime',
      description: 'When this article was/will be published',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),

    // Featured Image
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'Main image for the article',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Describe the image for accessibility',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // Additional Images (Gallery)
    defineField({
      name: 'additionalImages',
      title: 'Additional Images',
      type: 'array',
      description: 'Gallery images for the article',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),

    // Facebook Link
    defineField({
      name: 'facebookLink',
      title: 'Facebook Link',
      type: 'url',
      description: 'Link to Facebook post (optional)',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
    }),

    // Published Status
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Toggle to make visible on website',
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'titleRo',
      subtitle: 'category',
      media: 'featuredImage',
      published: 'published',
    },
    prepare(selection) {
      const { title, subtitle, media, published } = selection;
      return {
        title: title || 'Untitled',
        subtitle: `${subtitle} ${published ? '✓ Published' : '✗ Draft'}`,
        media,
      };
    },
  },
});
