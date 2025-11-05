# Sanity CMS - Quick Start Guide

## 🚀 What You Need To Do

### 1. Create Sanity Account & Project

1. Go to: https://www.sanity.io/get-started
2. Sign up (use Google/GitHub)
3. Create project:
   - Name: "Scoala Romaneasca Mihai Eminescu"
   - Schema: **"Clean project with no predefined schemas"**
   - Dataset: `production`
4. **Save your Project ID** (looks like: `abc123xyz`)

### 2. Get API Token

1. Go to: https://www.sanity.io/manage
2. Select your project → API → Tokens
3. Add token:
   - Name: "Netlify Production"
   - Permissions: **"Editor"**
4. **Copy and save the token!** (you won't see it again)

### 3. Update Files

**Update `sanity.config.ts` line 9:**
```typescript
projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'YOUR_PROJECT_ID_HERE',
```

**Update `sanity.cli.ts` line 5:**
```typescript
projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'YOUR_PROJECT_ID_HERE',
```

**Create `.env` file:**
```bash
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
SANITY_STUDIO_PROJECT_ID=your_project_id_here
SANITY_STUDIO_DATASET=production
LT_URL=https://translate.argosopentech.com/translate
```

### 4. Initialize Sanity

```bash
npx sanity init --y
```

### 5. Test Locally

**Start Sanity Studio (content editor):**
```bash
npm run studio
```
Opens at: http://localhost:3333

**Start website + API (full stack):**
```bash
netlify dev
```
Opens at: http://localhost:8888

### 6. Add Content

1. Open Sanity Studio
2. Create a News Post:
   - Fill in Romanian fields (required)
   - Leave English fields empty (auto-translates)
   - Upload images
   - Toggle "Published" ON
3. Check website at http://localhost:8888/news

### 7. Deploy Sanity Studio (Optional)

```bash
npm run studio:deploy
```
Get a hosted URL like: `https://your-project.sanity.studio`

### 8. Configure Netlify

Netlify Dashboard → Site Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `SANITY_PROJECT_ID` | Your project ID |
| `SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Your API token |

### 9. Deploy

```bash
git add .
git commit -m "Migrate to Sanity CMS"
git push
```

---

## 🎯 Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `npm run studio` | Open Sanity Studio (content editor) |
| `npm run studio:deploy` | Deploy Studio to cloud |
| `netlify dev` | Test full stack locally |
| `npm run dev` | Frontend only (no API) |
| `npm run build` | Build for production |

---

## 📝 Content Workflow

1. **Create content in Romanian** → required
2. **Leave English empty** → auto-translates
3. **OR add English manually** → better quality
4. **Toggle Published ON** → makes visible
5. **Content appears on website** → immediately!

---

## 🐛 Quick Fixes

**Studio won't start?**
→ Check Project ID in `sanity.config.ts`

**No content showing?**
→ Check "Published" toggle is ON

**Images not loading?**
→ Upload to Sanity (don't use external URLs)

**API errors?**
→ Check `.env` file has correct credentials

---

## 📚 Full Documentation

See `SANITY_MIGRATION_GUIDE.md` for complete details.

---

## ✅ Ready to Go?

1. [ ] Sanity account created
2. [ ] Project ID obtained
3. [ ] API Token obtained
4. [ ] Files updated with credentials
5. [ ] `npx sanity init` completed
6. [ ] `npm run studio` works
7. [ ] `netlify dev` works
8. [ ] Test content created
9. [ ] Netlify env vars configured
10. [ ] Deployed successfully

**You're all set! 🎉**
