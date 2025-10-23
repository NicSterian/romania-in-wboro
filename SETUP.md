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
