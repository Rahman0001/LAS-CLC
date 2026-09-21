import { useEffect } from 'react';
import type { BlogPost } from '../types';

export interface MetaTagOptions {
  title?: string;
  description?: string;
  author?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  articlePublishedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, any>;
}

export const DEFAULT_SITE_META: MetaTagOptions = {
  title: 'Legal Aid Society — Campus Law Centre, University of Delhi',
  description:
    'Official institutional portal and digital access platform for the Legal Aid Society of Campus Law Centre (CLC), Faculty of Law, University of Delhi.',
  ogTitle: 'Legal Aid Society — Campus Law Centre, University of Delhi',
  ogDescription:
    'Official institutional portal and digital access platform for the Legal Aid Society of Campus Law Centre (CLC), Faculty of Law, University of Delhi.',
  ogType: 'website',
  ogImage: '/images/clc_seal.png',
  twitterTitle: 'Legal Aid Society — Campus Law Centre, University of Delhi',
  twitterDescription:
    'Official institutional portal and digital access platform for the Legal Aid Society of Campus Law Centre (CLC), Faculty of Law, University of Delhi.'
};

/**
 * Sets or creates a meta tag with a specific name or property attribute.
 */
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string | undefined): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  
  if (!content) {
    // If content is undefined or empty and tag exists, remove it
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or creates a link tag with a specific rel attribute.
 */
function setLinkTag(rel: string, href: string | undefined): void {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  
  if (!href) {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Injects or updates Schema.org JSON-LD script for rich institutional snippets.
 */
function setJsonLd(jsonLd: Record<string, any> | undefined): void {
  const scriptId = 'institutional-dynamic-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!jsonLd) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd, null, 2);
}

/**
 * Applies dynamic SEO metadata to document head.
 */
export function applySEO(meta: MetaTagOptions): void {
  if (typeof document === 'undefined') return;

  if (meta.title) {
    document.title = meta.title;
  }

  // Standard Meta Tags
  setMetaTag('name', 'description', meta.description);
  setMetaTag('name', 'author', meta.author);
  setMetaTag('name', 'keywords', meta.keywords);

  // Open Graph / Social Tags
  setMetaTag('property', 'og:title', meta.ogTitle || meta.title);
  setMetaTag('property', 'og:description', meta.ogDescription || meta.description);
  setMetaTag('property', 'og:type', meta.ogType || 'website');
  setMetaTag('property', 'og:url', meta.ogUrl || window.location.href);
  setMetaTag('property', 'og:image', meta.ogImage);

  // Article Specific Tags
  setMetaTag('property', 'article:published_time', meta.articlePublishedTime);
  setMetaTag('property', 'article:author', meta.articleAuthor || meta.author);
  setMetaTag('property', 'article:section', meta.articleSection);

  // Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', meta.twitterTitle || meta.ogTitle || meta.title);
  setMetaTag('name', 'twitter:description', meta.twitterDescription || meta.ogDescription || meta.description);
  setMetaTag('name', 'twitter:image', meta.twitterImage || meta.ogImage);

  // Canonical Link
  setLinkTag('canonical', meta.canonicalUrl || meta.ogUrl);

  // JSON-LD Structured Data
  setJsonLd(meta.jsonLd);
}

/**
 * Resets metadata back to default institutional portal branding.
 */
export function resetToDefaultSEO(): void {
  applySEO(DEFAULT_SITE_META);
  // Clean up any remaining article-specific tags
  setMetaTag('property', 'article:published_time', undefined);
  setMetaTag('property', 'article:author', undefined);
  setMetaTag('property', 'article:section', undefined);
  setJsonLd(undefined);
}

/**
 * Generates SEO options specifically tailored for an AAWAZ BlogPost.
 */
export function createBlogPostSEO(blog: BlogPost, baseUrl: string = window.location.origin): MetaTagOptions {
  const articleUrl = `${baseUrl}/aawaz/${blog.slug || blog.id}`;
  const displayTitle = `${blog.title} | AAWAZ — Legal Aid Society, Campus Law Centre`;
  const snippet = blog.excerpt || blog.subtitle || 'Scholarly socio-legal inquiry published under AAWAZ by the Legal Aid Society, CLC, DU.';
  const coverImage = blog.coverImage || `${baseUrl}/images/clc_seal.png`;
  const tagsList = Array.isArray(blog.tags) && blog.tags.length > 0 
    ? blog.tags.join(', ') 
    : `${blog.category}, Legal Aid, CLC, DU, Constitutional Law, Human Rights`;

  return {
    title: displayTitle,
    description: snippet,
    author: `${blog.author} (${blog.authorRole || 'Contributor'})`,
    keywords: tagsList,
    ogTitle: `${blog.title} — AAWAZ (CLC Legal Aid Society)`,
    ogDescription: snippet,
    ogType: 'article',
    ogUrl: articleUrl,
    ogImage: coverImage,
    articlePublishedTime: blog.date,
    articleAuthor: blog.author,
    articleSection: blog.category,
    twitterTitle: `${blog.title} — AAWAZ`,
    twitterDescription: snippet,
    twitterImage: coverImage,
    canonicalUrl: articleUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl
      },
      headline: blog.title,
      alternativeHeadline: blog.subtitle || undefined,
      description: snippet,
      image: coverImage,
      datePublished: blog.date,
      dateModified: blog.updatedAt || blog.date,
      author: {
        '@type': 'Person',
        name: blog.author,
        jobTitle: blog.authorRole || 'Contributor, AAWAZ Blog'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Legal Aid Society — Campus Law Centre, Faculty of Law, University of Delhi',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/clc_seal.png`
        }
      },
      articleSection: blog.category,
      keywords: tagsList,
      wordCount: blog.content ? blog.content.split(/\s+/).length : undefined
    }
  };
}

/**
 * React Hook to dynamically manage SEO tags for a blog article or custom page.
 * Automatically restores defaults when unmounted or when blog is cleared.
 */
export function useBlogSEO(blog: BlogPost | null | undefined): void {
  useEffect(() => {
    if (!blog) {
      resetToDefaultSEO();
      return;
    }

    const meta = createBlogPostSEO(blog);
    applySEO(meta);

    return () => {
      resetToDefaultSEO();
    };
  }, [blog]);
}
