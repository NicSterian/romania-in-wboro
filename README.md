# Școala Românească Wellingborough

Bilingual (RO/EN) website for **Școala Românească Wellingborough** (Romanian weekend school in Wellingborough), deployed on Netlify and powered by Sanity CMS for News + Gallery.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- React Router
- `react-i18next` (single-site bilingual UI; no separate `/en` routes)
- Netlify Functions (server-side API + translation proxy)
- Sanity Studio (content editing)

## Getting started

### 1) Install dependencies

```sh
npm install
```

### 2) Environment variables

Copy `.env.example` to `.env` for local development (never commit `.env` files).

Required for Netlify Functions (News/Gallery):
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN`

Required for Sanity Studio:
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

Optional:
- `LT_URL` (translation endpoint used by `/api/translate`)

### 3) Run locally

Frontend only:
```sh
npm run dev
```

Full-stack local dev (recommended, includes Netlify Functions + redirects):
```sh
netlify dev
```

Sanity Studio (content editor):
```sh
npm run studio
```

Build:
```sh
npm run build
```

## Where things live (project map)

### App entry + routing
- `index.html` – base HTML + default meta tags + Netlify contact form definition
- `src/main.tsx` – React entry point
- `src/App.tsx` – providers + routes + i18n init (`src/i18n/config.ts`)

### Pages (routes)
- `src/pages/Home.tsx` – parents-first homepage (quick facts, schedule, fees, latest news preview)
- `src/pages/About.tsx` – mission, “two names” explanation, founder section (Laura Nan)
- `src/pages/Enrolment.tsx` – enrolment steps + embedded Jotform + FAQ
- `src/pages/News.tsx` / `src/pages/NewsPost.tsx` – news listing + post detail (Sanity via API)
- `src/pages/Gallery.tsx` – albums + lightbox (Sanity via API)
- `src/pages/Contact.tsx` – Netlify form + map embed
- `src/pages/*Policy.tsx` – legal/policy pages

### Shared layout/components
- `src/components/Layout.tsx` – header/footer wrapper
- `src/components/Header.tsx` – navigation + language switcher (desktop + improved mobile UX)
- `src/components/Footer.tsx` – footer + clickable Google Maps address link
- `src/components/ui/*` – shadcn/ui primitives used across the site

### i18n (RO/EN)
- `src/i18n/config.ts` – i18next setup + language detection
- `src/i18n/locales/ro.json` / `src/i18n/locales/en.json` – translations
  - Branding keys: `brand.primary`, `brand.secondary`, `brand.legal`

### SEO (titles)
- `src/lib/seo.ts` – site title helpers
- `src/lib/usePageTitle.ts` – per-page `document.title` + `<html lang>` helper

### Content + translation API
The client calls:
- `/api/news` and `/api/news/:slug`
- `/api/gallery` and `/api/gallery/:slug`
- `/api/translate`

Implementation:
- `netlify/functions/sanity-news.ts` – Sanity → News API (mapped to Rich Text)
- `netlify/functions/sanity-gallery.ts` – Sanity → Gallery API
- `netlify/functions/translate.ts` – translation proxy used for on-the-fly EN translation
- `netlify.toml` – routes `/api/*` to Netlify Functions + SPA redirect + CSP headers

Client fetch wrappers:
- `src/lib/api.ts` – client-side fetch wrappers for `/api/news` + `/api/gallery` (endpoints are backed by Sanity via `netlify.toml` redirects)
- `src/lib/translate.ts` – calls `/api/translate`

### Sanity Studio
- `sanity.config.ts` / `sanity.cli.ts` – studio config (uses `SANITY_STUDIO_*` env vars)
- `sanity/schemas/*` – content schemas (News posts + Gallery albums)

## Content editing workflow

- Use `npm run studio` to add/edit News posts and Gallery albums.
- The website reads published content through Netlify Functions.

## Notes

- Enrolment form is a Jotform embed inside `src/pages/Enrolment.tsx` (update the URL there if the form changes).
- CSP is set in `netlify.toml`; if you embed new third-party content (e.g. another form/map provider), update `frame-src` accordingly.
