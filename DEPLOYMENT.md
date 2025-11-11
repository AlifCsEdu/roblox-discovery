# Cloudflare Pages Deployment Guide

## Quick Setup

### 1. Cloudflare Pages Configuration

In your Cloudflare Pages dashboard:

**Build Settings:**
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (leave empty)
Node version: 20.x
```

**IMPORTANT:** Leave the "Deploy command" field **empty**. Cloudflare Pages will automatically handle deployment after the build completes.

### 2. Environment Variables

Add these in **Settings** → **Environment variables**:

#### Required (Production):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-project.pages.dev
```

#### Optional (if using server-side admin features):
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy

Simply push to your `main` branch:
```bash
git push origin main
```

Cloudflare Pages will automatically:
1. Detect the push
2. Run `npm install`
3. Run `npm run build`
4. Deploy the `.next` output

---

## Build Configuration Details

### Next.js Configuration

The `next.config.ts` is configured for Cloudflare Pages:

- **Output**: `standalone` mode for server-side features (tRPC, dynamic routes)
- **Images**: `unoptimized: true` (Cloudflare Pages doesn't support Next.js Image Optimization)
- **Remote Images**: Configured for Roblox CDN URLs

### Supported Features ✅

- ✅ Static pages (/, /explore, /search)
- ✅ Dynamic routes (/games/[id], /genres/[slug])
- ✅ API routes via tRPC (/api/trpc/[trpc])
- ✅ Server-side rendering
- ✅ Client-side navigation
- ✅ Environment variables

### Known Limitations ⚠️

- ❌ Next.js Image Optimization (use `unoptimized: true`)
- ❌ Node.js runtime-specific features (uses Edge Runtime)
- ❌ Middleware (limited support in Edge Runtime)

---

## Troubleshooting

### Issue: "npx wrangler deploy" error

**Solution**: Remove any "Deploy command" from Cloudflare Pages settings. Next.js apps don't need a separate deploy command.

### Issue: Images not loading

**Solution**: Verify `unoptimized: true` is in next.config.ts and remote patterns are configured.

### Issue: API routes failing

**Solution**: Check environment variables are set in Cloudflare Pages dashboard (not just .env.local).

### Issue: Build timeout

**Solution**: Ensure Node.js version is set to 20.x in Cloudflare Pages settings.

---

## Alternative: Vercel Deployment

If you prefer Vercel (which has full Next.js support):

1. Import your GitHub repository to Vercel
2. Add the same environment variables
3. Deploy (automatic configuration)

Vercel provides:
- Full Next.js Image Optimization
- Better Next.js 16 support
- Automatic edge runtime
- Built-in analytics

---

## Local Testing

Test production build locally:

```bash
npm run build
npm start
```

The app will run on http://localhost:3000 with production optimizations.
