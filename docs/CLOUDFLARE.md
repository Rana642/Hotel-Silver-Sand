# Hotel Silver Sand Multan on Cloudflare (instead of Vercel)

Why: on 17 Nov 2026 Vercel paused the Hobby project ("Deployments Paused") for passing the Edge Requests fair-use limit
(CDN requests 1,036,274 / 1,000,000; ISR writes 683,003 / 200,000). Hobby is also not meant for a business site.
Decision (Shoaib, 17 Nov): move to Cloudflare. This branch (`cloudflare`, on top of `fewer-requests`) is prepared for it.

## What is in the repo
- `wrangler.jsonc`: the Worker `hotel-silver-sand`, R2 bucket `hotel-silver-sand-cache` (page cache), Durable Objects (revalidation queue and tag cache), the Images binding.
- `open-next.config.ts`: OpenNext (`@opennextjs/cloudflare@1.19.2`, pinned: it supports Next 16.2.3 and up, this site is on 16.3.0).
- `public/_headers`: long cache for `/_next/static/*`.
- `package.json` scripts: `preview`, `deploy`, `upload`, `cf-typegen`. `next.config.ts` calls `initOpenNextCloudflareForDev()`.
- `fewer-requests` changes (still needed): no Link prefetch, hero slider loads only 2 slides, ISR 600 s / 3600 s.

## Checked, and what is NOT checked
- Checked here: type-check; `opennextjs-cloudflare build`; `wrangler deploy --dry-run` (all bindings recognised, Worker about 1.6 MB gzip, under the 3 MB free limit);
  and the middleware for `/admin` ran in the local Workers runtime (redirect to login).
- **Not checked: the site itself running on Cloudflare.** The OpenNext adapter does not work on Windows (its Turbopack chunk matching uses `/` paths), so the build must
  run on Linux: Cloudflare's own build service does that. First deploy to the free `*.workers.dev` address and test everything before touching the domain.

## Cost (honest)
- Workers **Free** gives 10 ms CPU per request, which a Next.js server-rendered page can pass. Use **Workers Paid (about $5/month)**: 30 s CPU, 10 million requests/month included.
  Static files (JS, CSS, images in `/public`) are free and unlimited.
- R2 (the page cache) has a free tier but asks for a payment method. next/image optimisation through the Images binding: first 5,000 transformations a month free.

## Steps
1. Create a Cloudflare account (the hotel's, not a personal one). Upgrade to Workers Paid.
2. R2 → Create bucket → name `hotel-silver-sand-cache`.
3. Workers & Pages → Create → Import a repository → GitHub `Rana642/Hotel-Silver-Sand`, branch `cloudflare` (for the test).
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
   - Root directory: `/`
4. Settings → Variables and Secrets (also add the `NEXT_PUBLIC_*` ones as **Build** variables, they are baked in at build time). Same values as on Vercel:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACES_API_KEY`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL`,
   `NEXT_PUBLIC_GOOGLE_ADS_LABEL_WHATSAPP`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL_CALL`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL_SEARCH`, `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`,
   `META_ACCESS_TOKEN`, `META_MARKETING_API_TOKEN`, `META_AD_ACCOUNT_ID`, `RESEND_API_KEY`, `RESEND_FROM`, `NOTIFY_EMAIL`.
   Optional: `GA4_API_SECRET` (server-side GA4 purchase), `META_TEST_EVENT_CODE` (only while testing Meta events). Secrets stay in the dashboard, never in the repo.
5. Test on the `*.workers.dev` address: home, rooms, a room page, the booking form and a test booking (cancel it afterwards), thank-you page, admin login, gallery, images,
   `/robots.txt`, `/sitemap.xml`, and in the browser the Meta Pixel, GA4 and Google Ads tags firing.
6. Only then the domain. **Before** changing nameservers, copy every DNS record of `hotelsilversandmultan.com` into Cloudflare (especially MX, SPF/DKIM for e-mail such as
   info@hotelsilversandmultan.com and Resend), or the hotel's e-mail stops. Then change the nameservers at the registrar to Cloudflare's, and in the Worker add Custom domains
   `hotelsilversandmultan.com` and `www.hotelsilversandmultan.com`.
7. Switch the production branch to `main` (merge `cloudflare` into it) so every push deploys.
8. In Supabase (Auth → URL configuration) keep the site URL as is (same domain). Remove the domain from the paused Vercel project when the new site is live.

## If something fails on the first Linux build
Send the Cloudflare build log. Likely places: an environment variable missing at build, the R2 bucket not created yet (the deploy step fails on the binding), or a Node API
that needs the `nodejs_compat` flag (it is on).
