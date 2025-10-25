# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/be45ff6a-1537-4ec9-af7a-37953bfe94b0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/be45ff6a-1537-4ec9-af7a-37953bfe94b0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment configuration

**IMPORTANT: Never commit `.env` files to version control. All credentials must be set as environment variables.**

### Local Development

Create a `.env` file in the project root (already in `.gitignore`) with the following variables:

```
VITE_CONTENTFUL_SPACE_ID=
VITE_CONTENTFUL_ACCESS_TOKEN=
VITE_CONTENTFUL_NEWS_CONTENT_TYPE=newsPost
VITE_CONTENTFUL_GALLERY_CONTENT_TYPE=galleryAlbum
VITE_TRANSLATION_API_URL=/api/translate
```

Refer to `.env.example` for the complete list of required variables.

### Production (Netlify)

**Do not add credentials to any files.** Set all environment variables in:
- Netlify Dashboard → Site settings → Environment variables

Required variables:
- `VITE_CONTENTFUL_SPACE_ID` - Your Contentful space ID
- `VITE_CONTENTFUL_ACCESS_TOKEN` - Your Contentful Content Delivery API token
- `VITE_CONTENTFUL_NEWS_CONTENT_TYPE` - Content type ID (default: `newsPost`)
- `VITE_CONTENTFUL_GALLERY_CONTENT_TYPE` - Content type ID (default: `galleryAlbum`)
- `VITE_TRANSLATION_API_URL` - Translation endpoint (default: `/api/translate`)
- `LT_URL` - (Optional) External translation service URL for Netlify Function

### Security Notice

**Never commit secrets to Git.** If you accidentally exposed credentials:
1. Immediately rotate the tokens in Contentful
2. Update environment variables in Netlify
3. Remove the exposed values from Git history

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/be45ff6a-1537-4ec9-af7a-37953bfe94b0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
