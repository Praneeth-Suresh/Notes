# SEO launch checklist

The repository now generates crawlable static pages, canonical URLs, `robots.txt`, a complete sitemap with `<lastmod>` dates, and page-type structured data. The remaining work requires access to search-engine or Cloudflare accounts, a verification token, or your choice of domain.

## 2. Verify Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a **URL-prefix** property using the exact value `https://notes.praneeth-suresh-s.workers.dev/`.
3. Select the **HTML tag** verification method.
4. Copy the token from Google's tag. The finished tag will look like:

   ```html
   <meta name="google-site-verification" content="TOKEN_FROM_GOOGLE" />
   ```

5. Add the tag to the shared `<head>` output in `src/site-styling/internal/shell.js`, rebuild `dist`, deploy, and confirm the tag appears in the public homepage source before clicking **Verify**. The token is not a password, but it must match the property exactly.
6. In **Sitemaps**, submit `sitemap.xml`. The full URL should resolve to `https://notes.praneeth-suresh-s.workers.dev/sitemap.xml`.
7. Use **URL Inspection** and request indexing for these initial URLs:

   - `https://notes.praneeth-suresh-s.workers.dev/`
   - `https://notes.praneeth-suresh-s.workers.dev/about/`
   - `https://notes.praneeth-suresh-s.workers.dev/projects/`
   - `https://notes.praneeth-suresh-s.workers.dev/research-taste/`
   - `https://notes.praneeth-suresh-s.workers.dev/blog/a-research-program-for-inspectable-ml/`

Do not repeatedly request the same URL. Submission asks Google to crawl; it does not guarantee ranking or immediate indexing. Review Search Console's **Page indexing** report after several days for a specific exclusion reason if pages remain absent.

## 3. Add Bing Webmaster Tools

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/).
2. Import the verified Google Search Console property, or add the same exact site URL manually.
3. Submit `https://notes.praneeth-suresh-s.workers.dev/sitemap.xml`.
4. Use URL submission for the same five priority pages listed above.

## 4. Keep sitemap dates truthful

The build reads freshness dates from checked-in content:

- Update `content/site-metadata.json` when a site-wide template, navigation, or shared metadata change materially updates generated pages.
- Update the relevant `updatedAt` in `content/topic-manifest.json` when republishing a Notion topic tree.
- Update a project's `updatedAt` in `content/projects.json` after a meaningful case-study change.
- Keep each blog post's `publishedAt` unchanged after publication. Add or update `updatedAt` in `content/blog/blog-manifest.json` only after a substantive revision.

Use `YYYY-MM-DD`. The build rejects invalid dates. Do not change dates for spelling-only edits or merely to appear fresh.

## 5. Validate structured data after deployment

Test the homepage, one project page, one topic subpage, and one blog post with:

- [Schema.org Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

The generated site currently provides `Person`, `Organization`, `WebSite`, `WebPage`, `BlogPosting`, breadcrumbs, project `CreativeWork`, and optional `FAQPage` data. A valid schema helps search engines understand the pages but does not guarantee a rich result.

## 6. Consider a custom domain

A custom domain is optional, but it gives you a stable identity independent of `workers.dev`.

1. Buy or choose a name-based domain you intend to keep long term.
2. Add it as a Worker custom domain in the Cloudflare dashboard.
3. Change the production build's `--site-url` to the final HTTPS origin and rebuild. This updates canonicals, sitemap locations, RSS links, and structured-data identifiers together.
4. Add the custom-domain property to Search Console and Bing, then submit its sitemap.
5. Redirect the old `workers.dev` origin to the matching custom-domain paths. Do not leave both origins serving indexable duplicates.
6. Keep redirects for at least a year and update GitHub, LinkedIn, resume, and other public links.

## 7. Add discovery links

- Put the canonical site URL in your GitHub profile and profile README.
- Add it to LinkedIn's Featured section and your contact information.
- Link directly to one or two strong project or research pages when relevant instead of linking only to the homepage.
- Submit `https://notes.praneeth-suresh-s.workers.dev/feed.xml` to an RSS reader or directory you actually use.

## 8. Monitor without guessing

Check Search Console and Bing weekly for the first month. Record:

- indexed page count;
- sitemap fetch status;
- excluded URLs and the stated reason;
- search queries and pages receiving impressions;
- crawl or server errors.

Fix reported technical exclusions first. Avoid changing titles, URLs, or content solely because indexing takes a few days; new properties commonly need time to be discovered and evaluated.
