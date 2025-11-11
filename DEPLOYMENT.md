# Deployment Guide

## Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js applications, offering full support for Next.js 16 with all features.

### Quick Deploy to Vercel

#### 1. Connect Your Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (use your GitHub account)
3. Click **"Add New Project"**
4. Import your GitHub repository: `AlifCsEdu/roblox-discovery`
5. Vercel will auto-detect Next.js configuration ✅

#### 2. Configure Environment Variables

Before deploying, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

Optional (if using server-side admin features):
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3. Deploy

Click **"Deploy"** - Vercel will:
1. Install dependencies (`npm install`)
2. Run build (`npm run build`)
3. Deploy to global edge network
4. Provide a live URL (e.g., `roblox-discovery.vercel.app`)

**Total time**: ~2-3 minutes ⚡

---

### Features Supported on Vercel ✅

- ✅ Full Next.js 16 support
- ✅ Next.js Image Optimization (automatic)
- ✅ Static pages (/, /explore, /search)
- ✅ Dynamic routes (/games/[id], /genres/[slug])
- ✅ API routes via tRPC (/api/trpc/[trpc])
- ✅ Server-side rendering & Edge runtime
- ✅ Automatic HTTPS with custom domains
- ✅ Built-in analytics & performance monitoring
- ✅ Preview deployments for every push
- ✅ Instant rollbacks

---

### Continuous Deployment

After initial setup, every push to `main` automatically:
1. Triggers a new deployment
2. Runs all checks
3. Creates a preview URL
4. Deploys to production (if checks pass)

**Preview deployments**: Every pull request gets its own URL for testing!

---

### Custom Domain (Optional)

To use your own domain:

1. Go to **Project Settings** → **Domains**
2. Add your domain (e.g., `robloxdiscover.com`)
3. Update your DNS records as instructed
4. Vercel handles SSL certificates automatically

---

## Alternative: Cloudflare Pages

> **Note**: Cloudflare Pages has limited support for Next.js 16. Server-side features (tRPC, dynamic routes) may not work properly. Vercel is recommended.

If you still want to use Cloudflare Pages:

### Requirements
- Downgrade to Next.js 15
- Use `@cloudflare/next-on-pages` adapter
- Limited Image Optimization

### Configuration

```bash
# Downgrade Next.js
npm install next@15.0.0

# Install adapter
npm install --save-dev @cloudflare/next-on-pages
```

Update `next.config.ts`:
```typescript
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true }
}
```

**Not recommended** - use Vercel instead for full Next.js 16 support.

---

## Local Testing

Test production build locally:

```bash
npm run build
npm start
```

The app will run on http://localhost:3000 with production optimizations.

---

## Troubleshooting

### Issue: Build fails on Vercel

**Solution**: Check that all environment variables are set in Vercel dashboard.

### Issue: Images not loading

**Solution**: 
- Verify Supabase URLs are correct
- Check Roblox CDN is accessible
- Vercel Image Optimization is automatic (no config needed)

### Issue: API routes failing

**Solution**: 
- Ensure environment variables include `NEXT_PUBLIC_` prefix for client-side vars
- Check Supabase keys are correct
- Verify no CORS issues

### Issue: Dynamic routes showing 404

**Solution**: 
- This is usually automatic on Vercel
- Check that routes are properly exported in your pages
- Review build logs for errors

---

## Deployment Checklist

Before deploying:

- [x] Repository pushed to GitHub
- [x] Environment variables documented
- [x] Build succeeds locally (`npm run build`)
- [x] All tests passing (`npm test`)
- [ ] Supabase project set up with correct permissions
- [ ] Environment variables added to Vercel
- [ ] Custom domain DNS configured (if applicable)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issues**: https://github.com/AlifCsEdu/roblox-discovery/issues
