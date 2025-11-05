# Sanity CMS Migration Guide

This guide will help you complete the migration from Contentful to Sanity CMS.

## 🎯 Why Sanity?

- ✅ **Better free tier**: Unlimited documents (vs Contentful's 25,000)
- ✅ **More users**: 3 users included (vs Contentful's 2)
- ✅ **Unlimited API requests**
- ✅ **Better image handling**: Built-in CDN with automatic optimization
- ✅ **Simpler architecture**: No confusing dual-field system
- ✅ **Real-time collaboration**
- ✅ **Modern, intuitive editor**

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. A Sanity account (free): https://www.sanity.io/get-started
2. Node.js installed (v18 or higher)
3. Netlify CLI installed: `npm install -g netlify-cli`

---

## 🚀 Step-by-Step Setup

### Step 1: Create Your Sanity Project

1. Go to https://www.sanity.io/get-started
2. Sign up with Google or GitHub (easiest)
3. Click **"Create new project"**
4. Fill in:
   - **Project name**: "Scoala Romaneasca Mihai Eminescu" (or your choice)
   - **Use schema**: Choose **"Clean project with no predefined schemas"**
   - **Dataset**: `production`

5. After creation, you'll see your **Project ID** (looks like: `abc123xyz`)
   - **Save this!** You'll need it in the next steps

---

### Step 2: Get Your API Token

1. Go to https://www.sanity.io/manage
2. Select your project
3. Click **"API"** in the left sidebar
4. Click **"Tokens"** tab
5. Click **"Add API token"**
6. Fill in:
   - **Name**: "Netlify Production"
   - **Permissions**: Choose **"Editor"** (allows read/write)
7. Click **"Add token"**
8. **Copy the token immediately!** You won't see it again
   - **Save this!** You'll need it in the next steps

---

### Step 3: Update Configuration Files

Now that you have your Project ID and API Token, update these files:

#### 3.1. Update `sanity.config.ts`

Replace `YOUR_PROJECT_ID` with your actual project ID:

```typescript
projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'abc123xyz',  // ← Your Project ID here
```

#### 3.2. Update `sanity.cli.ts`

Replace `YOUR_PROJECT_ID` with your actual project ID:

```typescript
projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'abc123xyz',  // ← Your Project ID here
```

#### 3.3. Create `.env` file

Create a new file called `.env` in the project root with these contents:

```bash
# Sanity CMS Configuration (Required for Netlify Functions)
SANITY_PROJECT_ID=abc123xyz              # ← Your Project ID
SANITY_DATASET=production
SANITY_API_TOKEN=skAbcDef123...          # ← Your API Token

# Sanity Studio Configuration (Required for Studio)
SANITY_STUDIO_PROJECT_ID=abc123xyz       # ← Your Project ID (same as above)
SANITY_STUDIO_DATASET=production

# Optional Translation API (keep as is)
LT_URL=https://translate.argosopentech.com/translate
```

**Important:** This file is already in `.gitignore` and will NOT be committed to GitHub.

---

### Step 4: Initialize Sanity Studio

Run this command to set up the Sanity Studio:

```bash
npx sanity init --y
```

When prompted:
- **Project to use**: Select your project from the list
- **Dataset**: Select `production`
- **Output path**: Press Enter (uses default)

This will link your local setup to your Sanity project.

---

### Step 5: Test Sanity Studio Locally

Start the Sanity Studio:

```bash
npm run studio
```

This will open the Sanity Studio at `http://localhost:3333`

You should see:
- **News Posts** section
- **Gallery Albums** section

Try creating a test news post to verify everything works!

---

### Step 6: Deploy Sanity Studio (Optional but Recommended)

Deploy your Sanity Studio to Sanity's hosting (free):

```bash
npm run studio:deploy
```

You'll get a URL like: `https://your-project.sanity.studio`

This allows you to edit content from anywhere, not just your computer.

---

### Step 7: Test Netlify Functions Locally

Now test the full stack (frontend + backend):

```bash
netlify dev
```

This will:
- ✅ Start Vite dev server (frontend)
- ✅ Start Netlify Functions (API)
- ✅ Load environment variables from `.env`
- ✅ Run everything at `http://localhost:8888`

**Test these pages:**
- Homepage: `http://localhost:8888`
- News: `http://localhost:8888/news`
- Gallery: `http://localhost:8888/gallery`

---

### Step 8: Add Content in Sanity Studio

1. Open Sanity Studio (local or deployed)
2. Click **"News Posts"** → **"Create new"**
3. Fill in the form:

**Romanian Content** (required):
- Title (Romanian): `Bun venit la școala noastră!`
- Excerpt (Romanian): `Suntem încântați să vă prezentăm Școala Românească...`
- Content (Romanian): Add your full article content

**English Content** (optional - leave empty to auto-translate):
- Title (English): Leave empty or add manual translation
- Excerpt (English): Leave empty or add manual translation
- Content (English): Leave empty or add manual translation

**Other Fields:**
- Category: Choose from dropdown
- Publication Date: Select date
- Featured Image: Upload image
- Published: Toggle ON to make visible

4. Click **"Publish"**

---

### Step 9: Configure Netlify Environment Variables

Before deploying to Netlify, add environment variables:

1. Go to Netlify Dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

| Key | Value |
|-----|-------|
| `SANITY_PROJECT_ID` | Your Sanity Project ID |
| `SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Your Sanity API Token |
| `LT_URL` | `https://translate.argosopentech.com/translate` |

5. Click **"Save"**

---

### Step 10: Deploy to Netlify

Commit your changes:

```bash
git add .
git commit -m "Migrate from Contentful to Sanity CMS"
git push -u origin claude/add-english-romani-support-011CUqGysajT7GvsB3RTrcUu
```

Netlify will automatically deploy. Check the deploy log for any errors.

---

## 🎨 Using Sanity Studio

### Creating a News Post

1. Open Sanity Studio
2. Click **"News Posts"** → **"Create new News Post"**
3. Fill in:
   - **Slug**: Click "Generate" next to the slug field
   - **Title (Romanian)**: Add your Romanian title
   - **Excerpt (Romanian)**: Add short description (max 150 characters)
   - **Content (Romanian)**: Write your full article
     - Use the formatting toolbar for bold, italic, headings
     - Click the image icon to add images inline
   - **Title (English)**: Optional - leave empty to auto-translate
   - **Excerpt (English)**: Optional - leave empty to auto-translate
   - **Content (English)**: Optional - leave empty to auto-translate
   - **Category**: Choose from dropdown
   - **Publication Date**: Select date and time
   - **Featured Image**: Click "Upload" to add main image
   - **Additional Images**: Click "Add item" to add gallery images
   - **Facebook Link**: Optional - add link to Facebook post
   - **Published**: Toggle ON when ready to publish

4. Click **"Publish"**

### Creating a Gallery Album

1. Open Sanity Studio
2. Click **"Gallery Albums"** → **"Create new Gallery Album"**
3. Fill in:
   - **Slug**: Click "Generate"
   - **Title (Romanian)**: Album title
   - **Description (Romanian)**: Album description
   - **Title (English)**: Optional - leave empty to auto-translate
   - **Description (English)**: Optional - leave empty to auto-translate
   - **Category**: Choose from dropdown
   - **Event Date**: Select date
   - **Cover Image**: Upload album cover
   - **Images**: Add all gallery images
   - **Published**: Toggle ON to make visible

4. Click **"Publish"**

---

## 🔄 Auto-Translation Feature

### How It Works

When you view the website in English:

1. If English fields (`titleEn`, `excerptEn`, `contentEn`) are filled → **uses those**
2. If English fields are empty → **auto-translates from Romanian** using the translation API
3. Translations are cached in browser localStorage for faster loading

### Best Practices

**For best quality:**
- ✅ **Manually enter English translations** in Sanity Studio
- ✅ Auto-translation is a fallback, not a replacement

**For convenience:**
- ✅ Leave English fields empty for quick publishing
- ✅ Add English translations later when you have time

---

## 🧹 Cleanup (Optional)

After verifying everything works, you can remove old Contentful files:

```bash
# Remove old Contentful functions
rm netlify/functions/contentful-news.ts
rm netlify/functions/contentful-gallery.ts

# Remove Contentful package (optional - only if you're sure)
npm uninstall contentful @contentful/rich-text-react-renderer
```

**Note:** Keep `@contentful/rich-text-types` - it's still used for type definitions.

---

## 🐛 Troubleshooting

### "Sanity credentials not configured"

**Cause:** Environment variables not set or incorrect

**Fix:**
1. Check `.env` file exists and has correct values
2. Restart `netlify dev` after changing `.env`
3. For production: Check Netlify environment variables

---

### "Post not found" / Empty news page

**Cause:** No published content in Sanity

**Fix:**
1. Open Sanity Studio
2. Create a news post
3. Toggle **"Published"** to ON
4. Click **"Publish"**
5. Refresh your website

---

### Images not loading

**Cause:** CSP headers blocking Sanity CDN

**Fix:** Already fixed in `netlify.toml`:
```toml
img-src 'self' data: https://cdn.sanity.io
```

If still not working:
1. Clear browser cache
2. Check browser console for CSP errors
3. Verify images are uploaded to Sanity (not external URLs)

---

### Sanity Studio won't start

**Cause:** Project ID not configured

**Fix:**
1. Check `sanity.config.ts` has your Project ID
2. Check `sanity.cli.ts` has your Project ID
3. Run `npx sanity init` again if needed

---

## 📚 Resources

- **Sanity Documentation**: https://www.sanity.io/docs
- **Sanity Studio**: https://www.sanity.io/docs/sanity-studio
- **GROQ Query Language**: https://www.sanity.io/docs/groq
- **Image URLs**: https://www.sanity.io/docs/image-url
- **Netlify Functions**: https://docs.netlify.com/functions/overview/

---

## 🎉 Success Checklist

Before deploying to production, verify:

- [ ] Sanity Project created
- [ ] API Token generated
- [ ] `.env` file created with correct credentials
- [ ] `sanity.config.ts` and `sanity.cli.ts` updated with Project ID
- [ ] Sanity Studio runs locally (`npm run studio`)
- [ ] Test content created in Sanity
- [ ] Frontend works locally (`netlify dev`)
- [ ] News page shows content
- [ ] Gallery page shows albums
- [ ] Language switching works
- [ ] Environment variables added to Netlify
- [ ] Code committed and pushed to GitHub
- [ ] Netlify deployment successful
- [ ] Production site works

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Check browser console for errors
3. Check Netlify deploy logs
4. Check Sanity Studio for published content
5. Verify environment variables are set correctly

---

## 📝 Summary of Changes

| Old (Contentful) | New (Sanity) |
|------------------|--------------|
| Confusing dual-field system | Clean, simple fields |
| 2 users | 3 users |
| 25,000 records limit | Unlimited records |
| Complex locale handling | Simple Romanian/English fields |
| External image URLs | Built-in CDN with optimization |
| No real-time collaboration | Real-time editing |
| Manual field management | Auto-generate slugs |
| Limited free tier | Generous free tier |

**Result:** Easier content management, better UX, no feature loss!
