import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
  const defaultTitle = 'Git DataHub - Manage GitHub Repository Datasets';
  const defaultDescription = 'A robust RESTful API system for cataloging and exploring github repository instruction datasets.';
  
  const displayTitle = title ? `${title} | Git DataHub` : defaultTitle;
  const displayDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Dynamic Title and Description */}
      <title>{displayTitle}</title>
      <meta name="description" content={displayDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Git DataHub" />

      {/* Structured data (schema.org) for search engines */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Git DataHub',
          'description': displayDescription,
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'All'
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
