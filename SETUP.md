# Environment Variables Setup

For local development, create a `.env` file in the root:
```
VITE_CONTENTFUL_SPACE_ID=your_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token
```

For production (Netlify), add these as environment variables in Netlify dashboard:
- Site settings → Environment variables
- Add both `VITE_CONTENTFUL_SPACE_ID` and `VITE_CONTENTFUL_ACCESS_TOKEN`

**IMPORTANT: Never commit the .env file to GitHub!** The .env file is already included in .gitignore to prevent accidental commits.

## Image Hosting Guide

### ⭐ Recommended: Contentful Assets (Best Option)

The best way to handle images is using Contentful's built-in **Media** field type:

1. In Contentful, edit your content type
2. Change field types from "Short Text" to "Media"
3. Set to "One file" for single images or "Many files" for multiple images
4. Upload images directly in Contentful when creating content
5. Images are automatically served via CDN and optimized

**Benefits:**
- ✅ Automatic CDN delivery
- ✅ Image optimization
- ✅ No external dependencies
- ✅ Most reliable

### Alternative: External Image URLs

If you prefer using external URLs with **Short Text** fields:

#### ✅ Supported Sources:

**1. Google Drive (RECOMMENDED for external)**
- Upload image to Google Drive
- Right-click → Share → "Anyone with the link can view"
- Copy the share link (looks like: `https://drive.google.com/file/d/1ABC123xyz456/view?usp=sharing`)
- Extract the FILE_ID (the part after `/d/` and before `/view`)
- Use this format in Contentful: `https://drive.google.com/uc?export=view&id=FILE_ID`

**Example:**
```
Share URL:  https://drive.google.com/file/d/1ABC123xyz456/view?usp=sharing
Direct URL: https://drive.google.com/uc?export=view&id=1ABC123xyz456
           Use this in Contentful ↑
```

**2. Other Supported Services:**
- Imgur: `https://i.imgur.com/xxxxx.jpg`
- Cloudinary: `https://res.cloudinary.com/...`
- imgBB: Direct image links
- Any direct image URL ending in `.jpg`, `.png`, `.gif`, `.webp`

#### ❌ NOT Supported:

- **Google Photos**: Cannot be embedded directly (use Google Drive instead)
- **Facebook**: Requires authentication
- **Instagram**: Requires authentication
- **Shortened URLs**: Must be direct links to images

### Current Schema Options

Your current schema uses **Short Text** fields for images:
- `featuredImageUrl` - Must be a direct image URL (see supported sources above)
- `additionalImages` - Comma or newline-separated URLs

**To switch to Contentful Assets (recommended):**
1. Go to Content model in Contentful
2. Add new fields: `featuredImage` (Media - One file) and `additionalImagesAssets` (Media - Many files)
3. Migrate your URLs to uploaded assets
4. Update field names in your content
5. The code already supports both URL and Asset fields

## Contentful Content Model Setup

### News Post Content Type (ID: `newsPost`)

Fields:
- **title** (Short Text, required) - Romanian title
- **titleEn** (Short Text, optional) - English title (auto-translated if empty)
- **slug** (Short Text, required, unique) - URL-friendly identifier
- **category** (Short Text, required) - One of: Anunțuri, Evenimente, Activități, Sărbători
- **publicationDate** (Date & Time, required) - Publication date
- **featuredImageUrl** (Short Text, required) - Main image URL
- **excerpt** (Long Text, required, max 150 chars) - Romanian excerpt
- **excerptEn** (Long Text, optional) - English excerpt (auto-translated if empty)
- **content** (Rich Text, required) - Romanian full content
- **contentEn** (Rich Text, optional) - English content (auto-translated if empty)
- **additionalImages** (Short Text, list, optional) - Additional image URLs
- **facebookLink** (Short Text, optional) - Facebook post URL
- **published** (Boolean, required) - Visibility flag

### Gallery Album Content Type (ID: `galleryAlbum`)

Fields:
- **albumTitle** (Short Text, required) - Romanian title
- **albumTitleEn** (Short Text, optional) - English title (auto-translated if empty)
- **category** (Short Text, required) - One of: Activități, Sărbători Românești, Ziua Națională, Crăciun, Paște
- **coverImageUrl** (Short Text, required) - Album cover image URL
- **images** (Short Text, list, required) - Array of image URLs
- **description** (Long Text, optional) - Romanian description
- **descriptionEn** (Long Text, optional) - English description (auto-translated if empty)
- **date** (Date & Time, optional) - Event date
- **published** (Boolean, required) - Visibility flag
