# 🚀 Deployment Guide - Pro Hunter

Complete guide to deploy your Pro Hunter app to production.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **Vercel Account** (free tier works)
- ✅ **Supabase Account** (free tier works)
- ✅ **GitHub Repository** (code pushed)
- ✅ **Domain Name** (optional, Vercel provides free subdomain)

---

## 🗄️ Step 1: Setup Supabase (Database)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `pro-hunter`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Southeast Asia (Singapore) - closest to Thailand
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### 1.2 Run Database Schema

1. Click **"SQL Editor"** (icon `</>` in left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of [`pro-hunter/auth-schema.sql`](pro-hunter/auth-schema.sql)
4. Paste into SQL Editor
5. Click **"Run"** (green button, bottom right)
6. Verify success: Go to **Table Editor** → See `profiles` table

**What this creates:**
- `profiles` table (user data: name, xp, coins, level, saved_product_ids)
- Automatic trigger (creates profile on signup)
- Row Level Security policies (users can only edit their own data)

### 1.3 Get API Keys

1. Click **"Settings"** (⚙️ icon) in left sidebar
2. Click **"API"**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

**Keep these safe!** You'll need them in the next step.

---

## ☁️ Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repo: `your-username/pro-hunter`
5. Click **"Import"**

### 2.2 Configure Build Settings

Vercel auto-detects Next.js. Verify these settings:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Don't click Deploy yet!** First, add environment variables.

### 2.3 Add Environment Variables

Click **"Environment Variables"** section, add these:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase → Settings → API |

**Important:**
- ✅ Make sure variable names start with `NEXT_PUBLIC_` (required for client-side access)
- ✅ No quotes around values
- ✅ Apply to all environments (Production, Preview, Development)

### 2.4 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. See **"Congratulations!"** screen
4. Click **"Visit"** to see your live app

**Your app is now live at:**
```
https://your-project-name.vercel.app
```

---

## ✅ Step 3: Verify Deployment

### 3.1 Test Core Features

Open your deployed URL and test:

1. **Home Page Loads** ✅
   - Visit: `https://your-app.vercel.app`
   - See: Deal feed, search bar, category pills

2. **Search Works** ✅
   - Type in search bar
   - See filtered results

3. **Authentication Works** ✅
   - Click "เข้าสู่ระบบ" (Login)
   - Enter your email
   - Check inbox for magic link
   - Click link → Auto login
   - See profile with 50 coins

4. **Save Deals Works** ✅
   - Click ❤️ heart icon on any product
   - Icon turns orange
   - Toast notification appears
   - Click "Saved" in nav → See saved deal

5. **Product Detail Works** ✅
   - Click any product card
   - Navigate to `/product/[id]`
   - See full details

6. **Database Persistence** ✅
   - Save a deal
   - Close browser completely
   - Reopen app → Saved deal still there

### 3.2 Check Console for Errors

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors (red text)

**Common errors & fixes:**
- `Supabase URL is undefined` → Add env variables, redeploy
- `CORS error` → Check Supabase URL is correct
- `401 Unauthorized` → Check anon key is correct

---

## 🌐 Step 4: Custom Domain (Optional)

### 4.1 Add Domain to Vercel

1. In Vercel dashboard, click your project
2. Go to **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Enter your domain: `yourdomain.com`

### 4.2 Configure DNS

Vercel will show DNS records to add. Example:

**For root domain** (`yourdomain.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain** (`www.yourdomain.com`):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Wait for Verification

- DNS propagation: 1-48 hours (usually 1-2 hours)
- Vercel auto-issues SSL certificate
- Check status in Vercel dashboard

### 4.4 Update Supabase Allowed URLs

1. Go to Supabase → **Settings** → **Authentication**
2. Scroll to **"Site URL"**
3. Add: `https://yourdomain.com`
4. Scroll to **"Redirect URLs"**
5. Add:
   ```
   https://yourdomain.com/**
   https://your-app.vercel.app/**
   ```

This allows magic links to work on your custom domain.

---

## 🔧 Step 5: Configure Supabase Auth

### 5.1 Enable Email Provider

1. Supabase → **Authentication** → **Providers**
2. Click **"Email"**
3. Toggle **"Enable Email provider"** → ON
4. Configure:
   - ✅ **Enable Email Signup**
   - ✅ **Enable Email Login**
   - ✅ **Confirm Email** (recommended)

### 5.2 Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Edit **"Magic Link"** template:

```html
<h2>Welcome to Pro Hunter! 🎉</h2>
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>Link expires in 60 minutes.</p>
```

3. Save changes

### 5.3 Test Email Delivery

1. Go to your deployed app
2. Click login
3. Enter email
4. Check inbox (and spam folder)
5. Click magic link
6. Verify auto-login works

---

## 📊 Step 6: Monitoring & Analytics

### 6.1 Vercel Analytics (Built-in)

1. In Vercel dashboard, click **"Analytics"**
2. Enable **Vercel Analytics** (free)
3. See real-time metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Performance scores

### 6.2 Vercel Speed Insights

1. In Vercel dashboard, click **"Speed Insights"**
2. Enable feature
3. See real user metrics:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to First Byte (TTFB)

### 6.3 Supabase Monitoring

1. Supabase → **Database** → **Usage**
2. Monitor:
   - Database size
   - Active connections
   - Query performance

**Free tier limits:**
- 500 MB database storage
- 2 GB bandwidth/month
- 50,000 monthly active users

---

## 🔐 Step 7: Security Hardening

### 7.1 Row Level Security (Already Done)

The `auth-schema.sql` includes RLS policies:
- Users can only read/update their own profile
- Cannot access other users' data

### 7.2 Enable Realtime Security

If you add realtime features:

1. Supabase → **Database** → **Replication**
2. Enable for tables you need
3. Add RLS policies for realtime

### 7.3 Rate Limiting (Optional)

Add rate limiting in Supabase:

1. Go to **Settings** → **API**
2. Configure rate limits:
   - Auth: 30 requests/hour/IP
   - Storage: 100 requests/minute

---

## 🚨 Troubleshooting Deployment Issues

### Issue 1: Build Fails on Vercel

**Error:** `Module not found: Can't resolve 'xxx'`

**Solution:**
```bash
# Ensure all dependencies in package.json
npm install --save-dev @types/node
git add package.json package-lock.json
git commit -m "fix: add missing dependencies"
git push
```

Vercel auto-redeploys on push.

---

### Issue 2: Environment Variables Not Working

**Symptoms:**
- App works locally but not in production
- Console error: "Supabase URL is undefined"

**Solution:**
1. Vercel dashboard → Settings → Environment Variables
2. Verify names are **exactly**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **"Redeploy"** (not just save)

---

### Issue 3: Magic Link Email Not Received

**Symptoms:**
- Login button works but no email arrives

**Solutions:**

**A. Check Supabase Logs:**
```
Supabase → Logs → Auth Logs
Look for: "Magic link sent to user@example.com"
```

**B. Enable SMTP (Custom Email)**
```
Supabase → Settings → Auth → SMTP Settings
Use: SendGrid, Mailgun, or AWS SES
Free tier: 100 emails/day
```

**C. Check Spam Folder:**
- Supabase emails may go to spam
- Mark as "Not Spam" to train filter

---

### Issue 4: Slow Page Load

**Symptoms:**
- App takes 5+ seconds to load

**Solutions:**

**A. Enable Image Optimization:**
```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image 
  src="/product.jpg" 
  alt="Product"
  width={300}
  height={300}
  priority // for above-the-fold images
/>
```

**B. Add Loading States:**
```tsx
// Add Suspense boundaries
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <ProductFeed />
</Suspense>
```

**C. Check Vercel Function Region:**
```
Vercel → Settings → Functions
Region: Singapore (closest to Thailand)
```

---

### Issue 5: Database Connection Error

**Error:** `Error: Connection to database failed`

**Solutions:**

**A. Check Supabase Status:**
- Visit: https://status.supabase.com
- See if service is down

**B. Verify Connection Pooling:**
```
Supabase → Settings → Database
Connection pooling: Enabled (default)
Mode: Transaction
```

**C. Check SSL Certificate:**
```typescript
// In lib/supabase.ts
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

---

## 🔄 Step 8: Continuous Deployment

### 8.1 Automatic Deployments

Vercel auto-deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs npm install
# 3. Runs npm run build
# 4. Deploys to production
```

### 8.2 Preview Deployments

Every pull request gets a preview URL:

```bash
# Create feature branch
git checkout -b feature/new-search

# Make changes, push
git push origin feature/new-search

# On GitHub:
# 1. Create Pull Request
# 2. Vercel comments with preview URL
# 3. Test preview before merging
```

### 8.3 Rollback if Needed

If deployment breaks production:

1. Vercel dashboard → **Deployments**
2. Find last working deployment
3. Click **"•••"** → **"Promote to Production"**
4. Instant rollback (0 downtime)

---

## 📈 Step 9: Performance Optimization

### 9.1 Enable Vercel Edge Functions

For faster response times:

```typescript
// pages/api/products.ts
export const config = {
  runtime: 'edge', // Run at edge locations
};
```

### 9.2 Add Caching Headers

```typescript
// next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate' },
        ],
      },
    ];
  },
};
```

### 9.3 Enable ISR (Incremental Static Regeneration)

```typescript
// app/(user)/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Page is statically generated, updates every 60s
}
```

---

## 🎯 Step 10: Post-Deployment Checklist

### Required Actions

- [ ] **Test all features** on production URL
- [ ] **Verify authentication** (magic link email arrives)
- [ ] **Check mobile responsiveness** (test on real devices)
- [ ] **Monitor Vercel analytics** (first 24 hours)
- [ ] **Set up error tracking** (Sentry, LogRocket)
- [ ] **Add SEO metadata** (title, description, OG images)
- [ ] **Submit to Google Search Console**
- [ ] **Set up uptime monitoring** (Pingdom, UptimeRobot)

### Optional Enhancements

- [ ] **Add PWA manifest** (already configured)
- [ ] **Enable offline mode** (service worker)
- [ ] **Set up CI/CD pipeline** (GitHub Actions)
- [ ] **Add E2E tests** (Playwright, Cypress)
- [ ] **Configure CDN** (Cloudflare, Vercel Edge)
- [ ] **Set up staging environment**
- [ ] **Add feature flags** (LaunchDarkly, Unleash)

---

## 💰 Cost Estimate

### Free Tier (Good for Testing)

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN
- **Cost: $0/month**

**Supabase:**
- ✅ 500 MB database
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Social OAuth included
- **Cost: $0/month**

**Total: $0/month** for small-scale testing

---

### Paid Tier (For Production)

**Vercel Pro:**
- 1 TB bandwidth/month
- Priority support
- Team collaboration
- **Cost: $20/month**

**Supabase Pro:**
- 8 GB database
- 250 GB bandwidth/month
- Daily backups
- 100,000 monthly active users
- **Cost: $25/month**

**Total: $45/month** for serious production

---

## 🔗 Useful Links

### Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

### Support

- **Vercel Discord**: https://vercel.com/discord
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: `your-repo/issues`

### Monitoring

- **Vercel Status**: https://www.vercel-status.com
- **Supabase Status**: https://status.supabase.com

---

## ✅ Deployment Complete!

Your Pro Hunter app is now live! 🎉

**What's Deployed:**
- ✅ Next.js frontend (Vercel)
- ✅ Supabase backend (Auth + Database)
- ✅ Automatic SSL certificate
- ✅ Global CDN
- ✅ Real-time data sync
- ✅ PWA support

**Next Steps:**
1. Share your app with users
2. Monitor analytics daily
3. Fix bugs reported by users
4. Add new features
5. Scale as needed

---

**Happy deploying! 🚀**

---

## 📝 Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production (test locally)
npm run build
npm start

# Deploy to Vercel (if using CLI)
vercel deploy

# Deploy to production
vercel deploy --prod

# View logs
vercel logs [deployment-url]

# List deployments
vercel ls
```

---

## 🐛 Emergency Rollback

If production is broken:

```bash
# Method 1: Via Dashboard
Vercel → Deployments → Find last good deploy → Promote

# Method 2: Via Git
git revert HEAD
git push origin main
# Vercel auto-deploys the revert

# Method 3: Via CLI
vercel rollback [deployment-url]
```

**Rollback time: < 1 minute** ⚡

---

**Your app is production-ready! 🎊**
