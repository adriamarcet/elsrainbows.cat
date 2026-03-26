import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = (process.env.SITE_URL || "https://elsrainbows.cat").replace(/\/+$/, "");
const DIST_DIR = path.resolve("dist");

const publicPages = [
  { path: "/", priority: "1.0" },
  { path: "/quisom.html", priority: "0.8" },
];

const toIsoDate = () => new Date().toISOString();

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages
  .map(
    ({ path: pagePath, priority }) => `  <url>
    <loc>${SITE_URL}${pagePath}</loc>
    <lastmod>${toIsoDate()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

await mkdir(DIST_DIR, { recursive: true });
await writeFile(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf8");
await writeFile(path.join(DIST_DIR, "robots.txt"), robotsTxt, "utf8");

console.log(`Generated sitemap.xml and robots.txt for ${SITE_URL}`);
