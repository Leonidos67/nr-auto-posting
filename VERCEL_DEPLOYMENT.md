# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)

## Prerequisites

1. A Vercel account ([Sign up](https://vercel.com/signup))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. MongoDB database accessible from the internet
4. API keys for AI services (Stability AI, OpenRouter, OpenAI)

## Step-by-Step Deployment

### 1. Push Your Code to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GIT_REPO_URL
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect it as a Next.js project

### 3. Configure Environment Variables

In Vercel project settings, add these environment variables:

**Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/video-saas` |
| `JWT_SECRET` | Secret key for JWT tokens | Random secure string |
| `STABILITY_API_KEY` | Stability AI API key | `sk-...` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Your app URL (set after deployment) | `https://your-app.vercel.app` |
| `TEST_MODE` | Test mode flag | `false` |
| `NEXT_PUBLIC_TEST_MODE` | Public test mode flag | `false` |

### 4. Build Settings

Vercel will auto-configure:
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Deploy

Click **"Deploy"** and wait for the build to complete (usually 2-5 minutes).

## Post-Deployment

### Update NEXT_PUBLIC_APP_URL

After your first deployment:

1. Copy your production URL from Vercel (e.g., `https://your-app.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` with your production URL
4. Redeploy the project

### Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` with your custom domain

### MongoDB Configuration

Ensure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0) or add Vercel's IP ranges to the whitelist.

## Environment-Specific Variables

You can set different environment variables for different environments:

- **Production**: Main deployment
- **Preview**: For pull request previews
- **Development**: For local development

## Troubleshooting

### Build Fails

1. Check the build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify MongoDB connection string is correct
4. Check if `ignoreBuildErrors: true` is masking TypeScript errors

### Runtime Errors

1. Check function logs in Vercel dashboard
2. Verify all API keys are valid
3. Ensure MongoDB is accessible from Vercel's servers
4. Check `NEXT_PUBLIC_APP_URL` matches your deployment URL

### Cookie/Authentication Issues

The middleware uses cookies for authentication. If you experience issues:
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Clear browser cookies and try again
- Check that the middleware matcher is correct

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Fill in your environment variables in .env.local

# Run development server
npm run dev
```

## Useful Commands

```bash
# Build for production
npm run build

# Start production server locally
npm start

# Link to Vercel project
vercel link

# Pull environment variables from Vercel
vercel env pull

# Deploy from CLI
vercel
```

## Monitoring

- **Vercel Analytics**: Already configured with `@vercel/analytics`
- **Function Logs**: Available in Vercel dashboard
- **Real-time Metrics**: Check Vercel dashboard for performance metrics

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/next.js/discussions)
