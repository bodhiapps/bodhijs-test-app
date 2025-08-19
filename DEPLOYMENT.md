# GitHub Pages Deployment Setup

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Automatic Deployment

The deployment workflow (`.github/workflows/deploy.yml`) will automatically:

1. **Trigger on push to main branch** - Every time you push to the main branch
2. **Build the project** - Install dependencies, run linting, and build the React+Vite app
3. **Deploy to GitHub Pages** - Upload the built files to GitHub Pages

## Setup Instructions

### 1. Enable GitHub Pages

**IMPORTANT**: Follow these steps exactly to avoid the "Not Found" error:

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. Save the configuration
6. **Wait 2-3 minutes** for GitHub to process the Pages enablement

**If you get "Get Pages site failed" error:**
- The workflow has been updated with `enablement: true` to automatically enable Pages
- Make sure your repository is public (GitHub Pages requires public repos for free accounts)
- Ensure you have admin access to the repository

### 2. Repository Settings

Make sure your repository name matches the base path in `vite.config.ts`. Currently set to:
```typescript
base: process.env.NODE_ENV === 'production' ? '/bodhijs-test-app/' : '/',
```

If your repository has a different name, update the base path accordingly.

### 3. Push to Deploy

Once configured, simply push to the main branch:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Action will automatically build and deploy your app.

## Manual Deployment (Alternative)

You can also deploy manually using the gh-pages package:

```bash
# Install dependencies (if not already installed)
npm install

# Deploy manually
npm run deploy
```

## Accessing Your Deployed App

After successful deployment, your app will be available at:
```
https://[your-username].github.io/bodhijs-test-app/
```

Replace `[your-username]` with your GitHub username.

## Workflow Features

- **Automatic linting** - Ensures code quality before deployment
- **Build optimization** - Creates production-optimized build
- **404 handling** - Copies index.html as 404.html for SPA routing support
- **Concurrent deployment protection** - Prevents deployment conflicts

## Troubleshooting

### Common GitHub Pages Errors

1. **"Get Pages site failed. Please verify that the repository has Pages enabled"**
   - Go to Settings → Pages and select "GitHub Actions" as source
   - Make sure repository is public (required for free GitHub accounts)
   - Wait 2-3 minutes after enabling Pages before pushing
   - The workflow now includes `enablement: true` to auto-enable Pages

2. **"HttpError: Not Found"**
   - Repository must be public for GitHub Pages (unless you have GitHub Pro)
   - Ensure you have admin/write permissions to the repository
   - Check that the repository name matches the base path in `vite.config.ts`

3. **Build fails**: 
   - Check the Actions tab for detailed error logs
   - ESLint errors have been fixed for the build scripts

4. **404 errors on deployed site**: 
   - Verify the base path in `vite.config.ts` matches your repository name
   - Current setting: `/bodhijs-test-app/` - change if your repo has a different name

5. **Pages not updating**: 
   - Check if GitHub Pages is enabled and source is set to "GitHub Actions"
   - Clear browser cache or try incognito mode

6. **Permission errors**: 
   - Ensure the repository has Pages enabled and Actions have write permissions
   - Check that GITHUB_TOKEN has pages: write permissions (automatically set in workflow)

## Environment Variables

The build process uses:
- `NODE_ENV=production` for production builds
- Automatic base path detection based on environment

No additional environment variables are required for basic deployment.
