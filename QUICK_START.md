# Quick Start Guide: aisend-voice-dmo Repository

This guide will help you quickly set up and deploy the `aisend-voice-dmo` repository.

## 🚀 Quick Setup (5 minutes)

### 1. Create Repository on GitHub

```bash
# Go to: https://github.com/new
# Repository name: aisend-voice-dmo
# Click "Create repository"
```

### 2. Push from Your Machine

```bash
# If starting with this codebase
git clone https://github.com/larcgs-ai/yt-niche-app.git aisend-voice-dmo
cd aisend-voice-dmo
rm -rf .git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/aisend-voice-dmo.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Cloudflare Pages

#### Option 1: Automatic (via Cloudflare Dashboard)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select `aisend-voice-dmo` repository
5. Build settings:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
6. Click **Save and Deploy**

Done! Your site will be live at `https://aisend-voice-dmo.pages.dev`

#### Option 2: Manual (via CLI)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build your project
npm install
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=aisend-voice-dmo
```

### 4. Set Up GitHub Actions (Optional but Recommended)

Add Cloudflare secrets to your GitHub repository:

1. Go to your GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add the following secrets:
   - `CLOUDFLARE_API_TOKEN`: Get from Cloudflare Dashboard → My Profile → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare Dashboard URL or Workers & Pages

The workflow file is already included in `.github/workflows/cloudflare-pages.yml`

## 📋 Daily Workflow

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Cloudflare automatically deploys! ✨
```

## 🔧 Configuration Files

This repository includes:

- ✅ `wrangler.toml` - Cloudflare Pages configuration
- ✅ `.nvmrc` - Node.js version specification
- ✅ `.github/workflows/cloudflare-pages.yml` - CI/CD workflow
- ✅ `CLOUDFLARE_SETUP.md` - Detailed setup instructions

## 🌐 Access Your Deployment

- **Production URL**: `https://aisend-voice-dmo.pages.dev`
- **Preview URLs**: Automatically created for PRs
- **Custom Domain**: Can be configured in Cloudflare Pages settings

## ⚙️ Environment Variables

If you need environment variables for your app:

1. Cloudflare Dashboard → Your Project → Settings → Environment Variables
2. Add variables for:
   - **Production** (main branch)
   - **Preview** (other branches/PRs)

## 🔍 Monitoring

- **Build logs**: Cloudflare Pages dashboard
- **Analytics**: Cloudflare Web Analytics (free to enable)
- **Deployment status**: GitHub Actions tab

## 📚 Next Steps

1. ✅ Repository created
2. ✅ Code pushed to GitHub
3. ✅ Deployed to Cloudflare Pages
4. 🎯 Add custom domain (optional)
5. 🎯 Configure environment variables (if needed)
6. 🎯 Set up monitoring and analytics

## 🆘 Troubleshooting

### Build fails on Cloudflare

- Check Node.js version (should be 18+)
- Verify `npm run build` works locally
- Check build logs in Cloudflare Pages

### Can't push to GitHub

- Verify repository URL: `git remote -v`
- Check authentication: `git config --list`
- Try HTTPS or SSH depending on setup

### Wrangler login issues

- Clear browser cache and cookies
- Try incognito/private mode
- Use `wrangler logout` then `wrangler login` again

## 📖 Additional Resources

- [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) - Detailed setup guide
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Actions for Cloudflare](https://github.com/cloudflare/pages-action)
