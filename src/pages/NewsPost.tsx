import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import type { Document } from '@contentful/rich-text-types';
import { getNewsPostBySlug, NewsPost } from '@/lib/api';
import { formatDate, getCategoryColor } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { translateRichText, translateText } from '@/lib/translate';
import { HERO_MAX_VH } from '@/config/ui';
import { usePageTitle } from '@/lib/usePageTitle';

const NewsPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayContent, setDisplayContent] = useState<Document | null>(null);
  usePageTitle(displayTitle || t('nav.news'), { lang });

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const lang = i18n.language === 'ro' ? 'ro' : 'en';
        const data = await getNewsPostBySlug(slug, lang);
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, i18n.language]);

  useEffect(() => {
    setLbOpen(false);
    setLbIndex(0);
  }, [post?.id]);

  const emptyDoc = useMemo<Document>(
    () => ({
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    }),
    []
  );

  useEffect(() => {
    if (!post) return;

    let cancelled = false;
    const lang = i18n.language === 'ro' ? 'ro' : 'en';

    const roTitle = post.originalTitleRo?.trim() ?? post.title?.trim() ?? '';
    const enTitle = post.titleEn?.trim() ?? '';
    const roContent = post.originalContentRo ?? post.content ?? emptyDoc;
    const enContent = post.contentEn ?? emptyDoc;

    const hasContent = (doc?: Document | null) => Boolean(doc && doc.content && doc.content.length > 0);

    const fallbackRoTitle = roTitle || enTitle || post.title || post.titleEn || '';
    const fallbackRoContent = hasContent(roContent)
      ? roContent
      : hasContent(enContent)
        ? enContent
        : emptyDoc;

    const fallbackEnTitle = enTitle || roTitle || post.titleEn || post.title || '';
    const fallbackEnContent = hasContent(enContent)
      ? enContent
      : hasContent(roContent)
        ? roContent
        : emptyDoc;

    if (lang === 'ro') {
      setDisplayTitle(fallbackRoTitle);
      setDisplayContent(fallbackRoContent);
      return () => {
        cancelled = true;
      };
    }

    setDisplayTitle(fallbackEnTitle);
    setDisplayContent(fallbackEnContent);

    const resolveForEn = async () => {
      if (cancelled) return;

      let nextTitle = enTitle;
      if (!nextTitle && roTitle) {
        nextTitle = await translateText(roTitle);
      } else if (!nextTitle && post.title) {
        nextTitle = await translateText(post.title);
      }

      let nextContent: Document | null = hasContent(enContent) ? enContent : null;
      if (!nextContent && hasContent(roContent)) {
        nextContent = await translateRichText(roContent);
      }

      if (!cancelled) {
        setDisplayTitle(nextTitle || fallbackEnTitle);
        setDisplayContent(nextContent ?? fallbackEnContent);
      }
    };

    resolveForEn();

    return () => {
      cancelled = true;
    };
  }, [post, i18n.language, emptyDoc]);

  useEffect(() => {
    if (!lbOpen || !post?.additionalImages?.length) return;

    const images = post.additionalImages;
    const len = images.length;
    const preload = (index: number) => {
      const src = images[(index + len) % len];
      if (!src) return;
      const img = new Image();
      img.src = src;
    };

    preload(lbIndex + 1);
    preload(lbIndex - 1);
  }, [lbOpen, lbIndex, post?.additionalImages]);

  const totalImages = post?.additionalImages?.length ?? 0;

  const openLightbox = useCallback(
    (index: number) => {
      if (!post?.additionalImages || post.additionalImages.length === 0) return;
      setLbIndex(index);
      setLbOpen(true);
    },
    [post?.additionalImages]
  );

  const closeLightbox = useCallback(() => {
    setLbOpen(false);
  }, []);

  const prev = useCallback(() => {
    if (!post?.additionalImages || post.additionalImages.length === 0) return;
    setLbIndex((i) => (i - 1 + post.additionalImages!.length) % post.additionalImages!.length);
  }, [post?.additionalImages]);

  const next = useCallback(() => {
    if (!post?.additionalImages || post.additionalImages.length === 0) return;
    setLbIndex((i) => (i + 1) % post.additionalImages!.length);
  }, [post?.additionalImages]);

  useEffect(() => {
    if (!lbOpen || totalImages === 0) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [lbOpen, totalImages, closeLightbox, prev, next]);

  useEffect(() => {
    if (!lbOpen || totalImages === 0) return;
    let x0: number | null = null;

    const start = (e: TouchEvent) => {
      x0 = e.touches[0]?.clientX ?? null;
    };

    const end = (e: TouchEvent) => {
      if (x0 == null) return;
      const dx = (e.changedTouches[0]?.clientX ?? x0) - x0;
      if (Math.abs(dx) > 40) {
        if (dx > 0) {
          prev();
        } else {
          next();
        }
      }
      x0 = null;
    };

    document.addEventListener('touchstart', start);
    document.addEventListener('touchend', end);

    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchend', end);
    };
  }, [lbOpen, totalImages, prev, next]);

  const richTextOptions = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node: unknown, children: ReactNode) => (
        <p className="mb-4 text-foreground leading-relaxed">{children}</p>
      ),
      [BLOCKS.HEADING_2]: (_node: unknown, children: ReactNode) => (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-primary">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node: unknown, children: ReactNode) => (
        <h3 className="text-xl font-bold mt-6 mb-3 text-primary">{children}</h3>
      ),
      [BLOCKS.UL_LIST]: (_node: unknown, children: ReactNode) => (
        <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node: unknown, children: ReactNode) => (
        <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
      ),
      [INLINES.HYPERLINK]: (node: any, children: ReactNode) => (
        <a
          href={node.data.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      ),
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4 text-destructive">
              {i18n.language === 'ro' ? 'Articol negăsit' : 'Post not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {i18n.language === 'ro' 
                ? 'Ne pare rău, articolul căutat nu există sau a fost șters.'
                : 'Sorry, the post you are looking for does not exist or has been deleted.'}
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {i18n.language === 'ro' ? 'Înapoi la Noutăți' : 'Back to News'}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <section className="py-6 border-b bg-background">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild>
            <Link to="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {i18n.language === 'ro' ? 'Înapoi la Noutăți' : 'Back to News'}
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <img
              src={post.featuredImageUrl || '/news-placeholder.jpg'}
              alt={displayTitle}
              style={{ maxHeight: `${HERO_MAX_VH}vh` }}
              className="w-full object-contain mx-auto bg-neutral-100 rounded-xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/news-placeholder.jpg';
              }}
            />
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <span className="text-muted-foreground">
              {formatDate(post.publicationDate, i18n.language as 'ro' | 'en')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-foreground">
            {displayTitle}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {documentToReactComponents(displayContent ?? emptyDoc, richTextOptions)}
          </div>

          {/* Additional Images */}
          {post.additionalImages?.length ? (
            <section className="mt-8">
              <h3 className="text-lg font-semibold mb-3">
                {lang === 'ro' ? 'Galerie' : 'Gallery'}
              </h3>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {post.additionalImages.map((src, i) => (
                  <button
                    key={src + i}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border"
                    onClick={() => openLightbox(i)}
                    aria-label={(lang === 'ro' ? 'Deschide imaginea ' : 'Open image ') + (i + 1)}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/news-placeholder.jpg';
                      }}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {lbOpen && post.additionalImages?.length ? (
            <div
              className="fixed inset-0 z-50 bg-black/90 p-4 md:p-10 flex items-center justify-center"
              onClick={closeLightbox}
              role="dialog"
              aria-modal="true"
            >
              <div className="relative h-full w-full max-w-5xl mx-auto flex items-center justify-center group">
                <button
                  className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-2 text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeLightbox();
                  }}
                  aria-label={lang === 'ro' ? 'Închide' : 'Close'}
                >
                  ✕
                </button>

                <button
                  className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label={lang === 'ro' ? 'Imaginea anterioară' : 'Previous image'}
                >
                  ←
                </button>

                <button
                  className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label={lang === 'ro' ? 'Imaginea următoare' : 'Next image'}
                >
                  →
                </button>

                <img
                  src={post.additionalImages?.[lbIndex] || '/news-placeholder.jpg'}
                  alt=""
                  className="max-h-[90vh] w-full max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/news-placeholder.jpg';
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* Facebook Link */}
          {post.facebookLink && (
            <div className="mt-8 p-6 bg-muted rounded-lg">
              <Button asChild variant="default">
                <a
                  href={post.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {i18n.language === 'ro' ? 'Vezi pe Facebook' : 'View on Facebook'}
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPostPage;
