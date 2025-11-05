import { defineType, defineField } from 'sanity';
import { ImagesIcon } from '@sanity/icons';

export default defineType({
  name: 'galleryAlbum',
  title: 'Gallery Album',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    // Slug (URL identifier)
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier',
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
      description: 'Album title in Romanian',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'descriptionRo',
      title: 'Description (Romanian)',
      type: 'text',
      description: 'Album description in Romanian',
      rows: 3,
    }),

    // English Content
    defineField({
      name: 'titleEn',
      title: 'Title (English)',
      type: 'string',
      description: 'Album title in English (leave empty to auto-translate)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Description (English)',
      type: 'text',
      description: 'Album description in English (leave empty to auto-translate)',
      rows: 3,
    }),

    // Category
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Evenimente (Events)', value: 'Evenimente' },
          { title: 'Sărbători Românești (Romanian Holidays)', value: 'Sărbători Românești' },
          { title: 'Activități Școlare (School Activities)', value: 'Activități Școlare' },
          { title: 'Excursii (Trips)', value: 'Excursii' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    // Date
    defineField({
      name: 'eventDate',
      title: 'Event Date',
      type: 'date',
      description: 'When the event took place',
      validation: (Rule) => Rule.required(),
    }),

    // Cover Image
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Main album cover image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // Images
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Gallery images',
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
      validation: (Rule) => Rule.required().min(1),
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
      media: 'coverImage',
      published: 'published',
    },
    prepare(selection) {
      const { title, subtitle, media, published } = selection;
      return {
        title: title || 'Untitled Album',
        subtitle: `${subtitle} ${published ? '✓ Published' : '✗ Draft'}`,
        media,
      };
    },
  },
});
