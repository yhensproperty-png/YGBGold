import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Warning: Supabase environment variables missing. Skipping dynamic sitemap.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const baseUrl = 'https://ygbgold.com';

interface Property {
  slug: string;
  updated_at: string;
}

async function generateSitemap() {
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/sell', priority: '0.8', changefreq: 'monthly' },
    { url: '/category/jewelry', priority: '0.7', changefreq: 'daily' },
    { url: '/category/coins', priority: '0.7', changefreq: 'daily' },
    { url: '/category/bars', priority: '0.7', changefreq: 'daily' },
    { url: '/category/scrap-gold', priority: '0.7', changefreq: 'daily' },
    { url: '/category/others', priority: '0.7', changefreq: 'daily' },
    { url: '/guides/purity', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/shipping', priority: '0.8', changefreq: 'monthly' },
    { url: '/guides/ofw', priority: '0.8', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  if (properties && properties.length > 0) {
    properties.forEach((property: Property) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/item/${property.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(property.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
  }

  xml += '</urlset>';

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  console.log(`📊 Total URLs: ${staticPages.length + (properties?.length || 0)}`);
}

generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
