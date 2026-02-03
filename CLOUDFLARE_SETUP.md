# Cloudflare Pages Deployment Guide

This guide will help you create a new repository named `aisend-voice-dmo` and deploy it to Cloudflare Pages.

## Prerequisites

- Git installed on your machine
- GitHub account
- Cloudflare account
- Node.js and npm installed

## Step 1: Create New Repository on GitHub

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right corner and select "New repository"
3. Repository name: `aisend-voice-dmo`
4. Choose visibility (Public or Private)
5. Do NOT initialize with README, .gitignore, or license (we'll push from local)
6. Click "Create repository"

## Step 2: Prepare Your Local Project

### Option A: Use this repository as a template

If you have access to this repository and want to use it as a starting point:

```bash
# Clone this repository to a new directory
git clone https://github.com/larcgs-ai/yt-niche-app.git aisend-voice-dmo
cd aisend-voice-dmo

# Remove the old git history
rm -rf .git

# Initialize new git repository
git init
git add .
git commit -m "Initial commit"
```

### Option B: Use your own existing project

If you already have a Vite/React project:

```bash
# Navigate to your project directory
cd your-project-directory
git init
git add .
git commit -m "Initial commit"
```

### Option C: Create a new Vite project

```bash
# Create a new Vite + React + TypeScript project
npm create vite@latest aisend-voice-dmo -- --template react-ts
cd aisend-voice-dmo
npm install
git init
git add .
git commit -m "Initial commit"
```

## Step 3: Connect to Your New GitHub Repository

```bash
# Add your new repository as the remote origin
git remote add origin https://github.com/YOUR_USERNAME/aisend-voice-dmo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Set Up Cloudflare Pages

### Option A: Using Cloudflare Dashboard (Recommended)

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "Workers & Pages" from the left sidebar
3. Click "Create application"
4. Select the "Pages" tab
5. Click "Connect to Git"
6. Authorize Cloudflare to access your GitHub account
7. Select the `aisend-voice-dmo` repository
8. Configure your build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave blank)
9. Click "Save and Deploy"

### Option B: Using Wrangler CLI

First, install Wrangler globally:

```bash
npm install -g wrangler
```

Then authenticate and deploy:

```bash
# Login to Cloudflare
wrangler login

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=aisend-voice-dmo
```

## Step 5: Configure Build Settings (if needed)

Create a `wrangler.toml` file in your project root:

```toml
name = "aisend-voice-dmo"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
cwd = "."
watch_dirs = ["src", "public"]

[build.upload]
format = "service-worker"
dir = "dist"
```

## Step 6: Set Up Continuous Deployment

Cloudflare Pages automatically sets up continuous deployment when connected to GitHub. Every push to your main branch will trigger a new deployment.

### Automatic Deployments

- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches or pull requests

### Environment Variables

If you need environment variables:

1. Go to your Cloudflare Pages project
2. Click on "Settings" > "Environment variables"
3. Add your variables for Production and Preview environments

## Step 7: Custom Domain (Optional)

1. In Cloudflare Pages project settings
2. Go to "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain name
5. Follow the DNS configuration instructions

## Workflow Summary

```bash
# Daily workflow after initial setup
git add .
git commit -m "Your commit message"
git push origin main
# Cloudflare automatically deploys your changes!
```

## Troubleshooting

### Build Failures

- Check the build logs in Cloudflare Pages dashboard
- Ensure your `package.json` scripts are correct
- Verify Node.js version compatibility

### Missing Dependencies

Add a `.nvmrc` file to specify Node version:

```
18.17.0
```

Or set the Node version in Cloudflare Pages:
- Settings > Environment Variables
- Add `NODE_VERSION` with value `18` or higher

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Authentication for Cloudflare](https://developers.cloudflare.com/pages/get-started/git-integration/)
