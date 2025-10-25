import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { getNewsPosts, NewsPost } from '@/lib/contentful';
import { formatDate, getCategoryColor } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NewsCardSkeleton } from '@/components/NewsCardSkeleton';
import { Button } from '@/components/ui/button';
import { translateText } from '@/lib/translate';

const News = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [translations, setTranslations] = useState<Record<string, { title?: string; excerpt?: string }>>({});

  const categories = i18n.language === 'ro' 
    ? ['Toate', 'Anunțuri', 'Evenimente', 'Activități', 'Sărbători']
    : ['All', 'Announcements', 'Events', 'Activities', 'Holidays'];

  const categoryMap: Record<string, string> = {
    'Toate': 'all',
    'All': 'all',
    'Anunțuri': 'Anunțuri',
    'Announcements': 'Anunțuri',
    'Evenimente': 'Evenimente',
    'Events': 'Evenimente',
    'Activități': 'Activități',
    'Activities': 'Activități',
    'Sărbători': 'Sărbători',
    'Holidays': 'Sărbători',
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(false);
      try {
        const lang = i18n.language === 'ro' ? 'ro' : 'en';
        const data = await getNewsPosts(lang);
        setPosts(data);
        setFilteredPosts(data);
      } catch (err) {
        console.error('Error fetching news posts:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [i18n.language]);

  useEffect(() => {
    if (i18n.language !== 'en') {
      setTranslations({});
      return;
    }

    let cancelled = false;

    const ensureTranslations = async () => {
      const entries = await Promise.all(
        posts.map(async (post) => {
          const existing = translations[post.id] ?? {};
          if (existing.title && existing.excerpt) {
            return [post.id, existing] as const;
          }

          let title = post.titleEn?.trim() || existing.title;
          let excerpt = post.excerptEn?.trim() || existing.excerpt;

          if (!title) {
            const sourceTitle = post.originalTitleRo?.trim() || post.title?.trim();
            if (sourceTitle) {
              title = await translateText(sourceTitle);
            }
          }

          if (!excerpt) {
            const sourceExcerpt = post.originalExcerptRo?.trim() || post.excerpt?.trim();
            if (sourceExcerpt) {
              excerpt = await translateText(sourceExcerpt);
            }
          }

          return [post.id, { title, excerpt }] as const;
        })
      );

      if (!cancelled) {
        setTranslations(Object.fromEntries(entries));
      }
    };

    if (posts.length > 0) {
      ensureTranslations();
    } else {
      setTranslations({});
    }

    return () => {
      cancelled = true;
    };
  }, [posts, i18n.language]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory));
    }
  }, [selectedCategory, posts]);

  const handleCategoryClick = (category: string) => {
    const mappedCategory = categoryMap[category];
    setSelectedCategory(mappedCategory);
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <section className="hero-gradient text-primary-foreground py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {t('news.hero')}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {t('news.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-destructive mb-4 text-lg">
              {i18n.language === 'ro' 
                ? 'Ne pare rău, a apărut o eroare la încărcarea conținutului.'
                : 'Sorry, an error occurred while loading content.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              {i18n.language === 'ro' ? 'Încearcă din nou' : 'Try again'}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('news.hero')}
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            {t('news.subtitle')}
          </p>
        </div>
      </section>

      {/* Category Filters */}
      {!loading && posts.length > 0 && (
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryMap[category] === selectedCategory ? 'default' : 'outline'}
                  onClick={() => handleCategoryClick(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Content */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Newspaper className="h-12 w-12 text-primary" />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {i18n.language === 'ro'
                  ? 'Noutățile vor fi publicate în curând! Urmărește această pagină pentru actualizări despre evenimentele și activitățile școlii noastre.'
                  : 'News will be published soon! Follow this page for updates about our school\'s events and activities.'}
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                {i18n.language === 'ro'
                  ? 'Nu există articole în această categorie.'
                  : 'No posts in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const roTitle = post.originalTitleRo?.trim() || post.title?.trim() || post.titleEn?.trim() || '';
                const roExcerpt = post.originalExcerptRo?.trim() || post.excerpt?.trim() || post.excerptEn?.trim() || '';
                const override = translations[post.id];
                const title = i18n.language === 'ro'
                  ? roTitle
                  : (override?.title?.trim() || post.titleEn?.trim() || roTitle);
                const excerpt = i18n.language === 'ro'
                  ? roExcerpt
                  : (override?.excerpt?.trim() || post.excerptEn?.trim() || roExcerpt);

                return (
                  <article
                    key={post.id}
                    className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={post.featuredImageUrl || '/news-placeholder.jpg'}
                      alt={title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/news-placeholder.jpg';
                      }}
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.publicationDate, i18n.language as 'ro' | 'en')}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2 text-foreground line-clamp-2">
                        {title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {excerpt}
                      </p>
                      <Button asChild variant="default" size="sm">
                        <Link to={`/news/${post.slug}`}>
                          {i18n.language === 'ro' ? 'Citește mai mult' : 'Read More'}
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
