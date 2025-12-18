# Vercel Speed Insights Setup Guide

This guide will help you get started with Vercel Speed Insights on the Zawadi Intel project. Speed Insights provides real user monitoring (RUM) data to help you understand your website's performance.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier available)
- A Vercel project (you can [create a new one](https://vercel.com/new))
- The [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but recommended)

## Installation Steps

### 1. Enable Speed Insights in Vercel Dashboard

1. Go to your [Vercel Dashboard](/dashboard)
2. Select your project (Zawadi Intel)
3. Click the **Speed Insights** tab
4. Select **Enable** from the dialog

> **Note:** Enabling Speed Insights will add new routes (scoped at `/_vercel/speed-insights/*`) after your next deployment.

### 2. Deploy to Vercel

The Speed Insights script has already been added to all HTML pages in this project. To start tracking performance:

#### Option A: Deploy via Git (Recommended)

1. Push your changes to GitHub:
   ```bash
   git push origin master
   ```

2. Vercel will automatically deploy your changes if you've connected your repository

#### Option B: Deploy via CLI

```bash
vercel deploy --prod
```

### 3. Monitor Your Performance

Once your app is deployed:

1. Users will visit your site
2. The Speed Insights script will automatically collect Web Vitals data
3. After a few days of traffic, go to your Vercel Dashboard → Speed Insights tab to view metrics

## Implementation Details

### Script Integration

The Speed Insights tracking script has been added to all HTML pages in the project:

```html
<!-- 📊 Vercel Speed Insights -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

This script:
- Is added to the root layout and all main pages
- Works on all article pages in `public/articles/`
- Automatically collects Web Vitals metrics (LCP, CLS, FCP, FID, TTFB)
- Does not impact page load performance (loaded with `defer` attribute)

### Files Modified

**Main Pages:**
- `index.html` - Home page
- `about.html` - About page
- `global.html` - Global news page
- `biography.html` - Biographies page
- `books.html` - Books page
- `media.html` - Media page
- `app.html` - Archive page
- `account.html` - Account page
- `profile.html` - Profile page

**Article Pages:**
- All HTML files in `public/articles/` (67 files)

## Key Metrics Tracked

Vercel Speed Insights tracks the Core Web Vitals:

1. **Largest Contentful Paint (LCP)** - Loading performance
2. **First Input Delay (FID)** / **Interaction to Next Paint (INP)** - Interactivity
3. **Cumulative Layout Shift (CLS)** - Visual stability

## Using Speed Insights Data

After collecting data, use the dashboard to:

- View performance trends over time
- Identify performance bottlenecks
- Compare performance across different pages
- Set performance budgets
- Get actionable recommendations

## Privacy & Compliance

The Speed Insights implementation follows privacy best practices:

- No Personally Identifiable Information (PII) is collected
- Data is compliant with GDPR and privacy standards
- You can configure what data is sent if needed

For more information, see [Vercel Speed Insights Privacy Policy](/docs/speed-insights/privacy-policy).

## Next Steps

1. **Deploy** - Push your changes and deploy to Vercel
2. **Wait for Data** - Let users visit your site for a few days
3. **Monitor** - Check the Speed Insights dashboard for real data
4. **Optimize** - Use the insights to improve your website's performance

## Learn More

- [Vercel Speed Insights Documentation](/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Performance Optimization Tips](/docs/speed-insights/metrics)
- [Troubleshooting](/docs/speed-insights/troubleshooting)

## Support

For issues or questions:
- Check the [Troubleshooting Guide](/docs/speed-insights/troubleshooting)
- Review the [FAQ](/docs/speed-insights/faq)
- Contact [Vercel Support](https://vercel.com/support)
