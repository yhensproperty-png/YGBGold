import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_KEYWORDS = '21k Saudi Gold, 18k Japan Gold, 24k Investment Gold, gold jewelry Philippines, buy gold online Philippines, OFW gold investment, global gold sourcing Philippines';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogImageAlt?: string;
  ogImageType?: string;
  ogSiteName?: string;
  ogLocale?: string;
  ogPriceAmount?: string;
  ogPriceCurrency?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  ogImageWidth,
  ogImageHeight,
  ogImageAlt,
  ogImageType,
  ogSiteName,
  ogLocale,
  ogPriceAmount,
  ogPriceCurrency,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
}) => {
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="fb:app_id" content="1234567890" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}
      {ogLocale && <meta property="og:locale" content={ogLocale} />}

      {/* Product Open Graph Data */}
      {ogPriceAmount && <meta property="og:price:amount" content={ogPriceAmount} />}
      {ogPriceCurrency && <meta property="og:price:currency" content={ogPriceCurrency} />}

      {/* Open Graph Images */}
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:secure_url" content={ogImage} />
          {ogImageWidth && <meta property="og:image:width" content={ogImageWidth} />}
          {ogImageHeight && <meta property="og:image:height" content={ogImageHeight} />}
          {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
          {ogImageType && <meta property="og:image:type" content={ogImageType} />}
        </>
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={twitterDescription || description} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
