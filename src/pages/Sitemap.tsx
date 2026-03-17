import React, { useEffect } from 'react';
import { PropertyListing } from '../types.ts';

interface SitemapProps {
  properties: PropertyListing[];
}

const Sitemap: React.FC<SitemapProps> = ({ properties }) => {
  useEffect(() => {
    const domain = window.location.origin;
    const activeProperties = properties.filter(p => p.status === 'active');

    const urls = [
      { loc: `${domain}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${domain}/about`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${domain}/sell`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${domain}/category/buy-houses`, priority: '0.7', changefreq: 'daily' },
      { loc: `${domain}/category/buy-condos`, priority: '0.7', changefreq: 'daily' },
      { loc: `${domain}/category/buy-land`, priority: '0.7', changefreq: 'daily' },
      { loc: `${domain}/category/rent`, priority: '0.7', changefreq: 'daily' },
      ...activeProperties.map(property => ({
        loc: `${domain}/property/${property.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: property.dateUpdated || property.dateListed
      }))
    ];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.textContent = 'Download sitemap.xml';

    document.body.innerHTML = `
      <div style="font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px;">
        <h1>Sitemap Generator</h1>
        <p>Your sitemap.xml has been generated with ${activeProperties.length} properties.</p>
        <pre style="background: #f5f5f5; padding: 20px; overflow: auto; border-radius: 8px;">${sitemapXml}</pre>
        <div style="margin-top: 20px;">
          <a href="${url}" download="sitemap.xml" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Download sitemap.xml</a>
        </div>
      </div>
    `;
  }, [properties]);

  return null;
};

export default Sitemap;
