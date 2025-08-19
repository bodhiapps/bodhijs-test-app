# GitHub Pages Deployment Setup

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Automatic Deployment

The deployment workflow (`.github/workflows/deploy.yml`) will automatically:

1. **Trigger on push to main branch** - Every time you push to the main branch
2. **Build the project** - Install dependencies, run linting, and build the React+Vite app
3. **Deploy to GitHub Pages** - Upload the built files to GitHub Pages

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the configuration

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

1. **Build fails**: Check the Actions tab for detailed error logs
2. **404 errors**: Verify the base path in `vite.config.ts` matches your repository name
3. **Pages not updating**: Check if GitHub Pages is enabled and source is set to "GitHub Actions"
4. **Permission errors**: Ensure the repository has Pages enabled and Actions have write permissions

## Environment Variables

The build process uses:
- `NODE_ENV=production` for production builds
- Automatic base path detection based on environment

No additional environment variables are required for basic deployment.
