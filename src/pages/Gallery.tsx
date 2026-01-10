import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { getGalleryAlbums, GalleryAlbum } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { translateText } from '@/lib/translate';
import { usePageTitle } from '@/lib/usePageTitle';

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  usePageTitle(t('nav.gallery'), { lang });
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [translations, setTranslations] = useState<Record<string, { title?: string; description?: string }>>({});

  const categories = i18n.language === 'ro'
    ? ['Toate', 'Activități', 'Sărbători Românești', 'Ziua Națională', 'Crăciun', 'Paște']
    : ['All', 'Activities', 'Romanian Holidays', 'National Day', 'Christmas', 'Easter'];

  const categoryMap: Record<string, string> = {
    'Toate': 'all',
    'All': 'all',
    'Activități': 'Activități',
    'Activities': 'Activități',
    'Sărbături Românești': 'Sărbători Românești',
    'Romanian Holidays': 'Sărbători Românești',
    'Ziua Națională': 'Ziua Națională',
    'National Day': 'Ziua Națională',
    'Crăciun': 'Crăciun',
    'Christmas': 'Crăciun',
    'Paște': 'Paște',
    'Easter': 'Paște',
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      setError(false);
      try {
        const lang = i18n.language === 'ro' ? 'ro' : 'en';
        const data = await getGalleryAlbums(lang);
        setAlbums(data);
        setFilteredAlbums(data);
      } catch (err) {
        console.error('Error fetching gallery albums:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [i18n.language]);

  useEffect(() => {
    if (i18n.language !== 'en') {
      setTranslations({});
      return;
    }

    let cancelled = false;

    const ensureTranslations = async () => {
      const entries = await Promise.all(
        albums.map(async (album) => {
          const existing = translations[album.id] ?? {};
          if (existing.title && existing.description) {
            return [album.id, existing] as const;
          }

          let title = album.albumTitleEn?.trim() || existing.title;
          let description = album.descriptionEn?.trim() || existing.description;

          if (!title) {
            const sourceTitle = album.originalAlbumTitleRo?.trim() || album.albumTitle?.trim();
            if (sourceTitle) {
              title = await translateText(sourceTitle);
            }
          }

          if (!description) {
            const sourceDescription = album.originalDescriptionRo?.trim() || album.description?.trim();
            if (sourceDescription) {
              description = await translateText(sourceDescription);
            }
          }

          return [album.id, { title, description }] as const;
        })
      );

      if (!cancelled) {
        setTranslations(Object.fromEntries(entries));
      }
    };

    if (albums.length > 0) {
      ensureTranslations();
    } else {
      setTranslations({});
    }

    return () => {
      cancelled = true;
    };
  }, [albums, i18n.language]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredAlbums(albums);
    } else {
      setFilteredAlbums(albums.filter(album => album.category === selectedCategory));
    }
  }, [selectedCategory, albums]);

  const handleCategoryClick = (category: string) => {
    const mappedCategory = categoryMap[category];
    setSelectedCategory(mappedCategory);
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <section className="hero-gradient text-primary-foreground py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {t('gallery.hero')}
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-destructive mb-4 text-lg">
              {i18n.language === 'ro'
                ? 'Ne pare rău, a apărut o eroare la încărcarea galeriei.'
                : 'Sorry, an error occurred while loading the gallery.'}
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            {t('gallery.hero')}
          </h1>
        </div>
      </section>

      {/* Category Filters */}
      {!loading && albums.length > 0 && (
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

      {/* Gallery Content */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          {loading ? (
            <LoadingSpinner />
          ) : albums.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                {t('gallery.empty.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {i18n.language === 'ro'
                  ? 'Galeria noastră foto va fi disponibilă în curând! Aici veți găsi imagini de la evenimentele și activitățile școlii noastre.'
                  : 'Our photo gallery will be available soon! Here you will find images from our school\'s events and activities.'}
              </p>
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                {i18n.language === 'ro'
                  ? 'Nu există albume în această categorie.'
                  : 'No albums in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAlbums.map((album) => {
                const override = translations[album.id];
                const roTitle = album.originalAlbumTitleRo?.trim() || album.albumTitle?.trim() || album.albumTitleEn?.trim() || '';
                const roDescription = album.originalDescriptionRo?.trim() || album.description?.trim() || album.descriptionEn?.trim() || '';
                const title = i18n.language === 'ro'
                  ? roTitle
                  : (override?.title?.trim() || album.albumTitleEn?.trim() || roTitle);
                const description = i18n.language === 'ro'
                  ? roDescription
                  : (override?.description?.trim() || album.descriptionEn?.trim() || roDescription);
                const albumHref = album.slug ? `/gallery/${album.slug}` : '/gallery';

                return (
                  <Link
                    key={album.id}
                    to={albumHref}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                      <img
                        src={album.coverImageUrl || '/news-placeholder.jpg'}
                        alt={title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/news-placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      {description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
