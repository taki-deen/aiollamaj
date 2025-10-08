export const generateReportSchema = (report: any) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const CLIENT_BASE_URL = window.location.origin;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: report.filename,
    description: getExcerpt(report.generatedReport),
    author: {
      '@type': 'Person',
      name: `${report.userId?.firstName || ''} ${report.userId?.lastName || ''}`,
      image: report.userId?.avatarUrl 
        ? `${API_BASE_URL}${report.userId.avatarUrl}` 
        : undefined
    },
    datePublished: report.generatedAt || report.createdAt,
    dateModified: report.generatedAt || report.createdAt,
    inLanguage: report.language === 'ar' ? 'ar' : 'en',
    image: report.userId?.avatarUrl 
      ? `${API_BASE_URL}${report.userId.avatarUrl}` 
      : `${CLIENT_BASE_URL}/logo512.png`,
    publisher: {
      '@type': 'Organization',
      name: 'AI Reports',
      logo: {
        '@type': 'ImageObject',
        url: `${CLIENT_BASE_URL}/logo512.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${CLIENT_BASE_URL}/blog/${report._id}`
    }
  };
};

export const generateBlogSchema = (reportsCount: number) => {
  const CLIENT_BASE_URL = window.location.origin;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'مدونة التقارير - AI Reports Blog',
    description: 'مدونة تحتوي على تقارير احترافية مولدة بالذكاء الاصطناعي',
    url: `${CLIENT_BASE_URL}/blog`,
    inLanguage: ['ar', 'en'],
    publisher: {
      '@type': 'Organization',
      name: 'AI Reports',
      logo: {
        '@type': 'ImageObject',
        url: `${CLIENT_BASE_URL}/logo512.png`
      }
    },
    numberOfItems: reportsCount
  };
};

export const getExcerpt = (content: string, maxLength: number = 160): string => {
  const cleanText = content.replace(/[#*`\n]/g, ' ').trim();
  return cleanText.length > maxLength
    ? cleanText.substring(0, maxLength).trim() + '...'
    : cleanText;
};

export const generateMetaTags = (
  title: string,
  description: string,
  url: string,
  image?: string,
  type: 'website' | 'article' = 'website'
) => {
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image || `${window.location.origin}/logo512.png` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image || `${window.location.origin}/logo512.png` }
    ]
  };
};

