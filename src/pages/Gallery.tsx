import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGalleryAlbums, GalleryAlbum } from '@/lib/contentful';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        const data = await getGalleryAlbums();
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
  }, []);

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

  const openLightbox = (album: GalleryAlbum, imageIndex = 0) => {
    setSelectedAlbum(album);
    setCurrentImageIndex(imageIndex);
  };

  const closeLightbox = () => {
    setSelectedAlbum(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedAlbum) {
      setCurrentImageIndex((prev) => 
        prev === selectedAlbum.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedAlbum) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedAlbum.images.length - 1 : prev - 1
      );
    }
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
                const title = i18n.language === 'ro' ? album.albumTitle : album.albumTitleEn;
                const description = i18n.language === 'ro' ? album.description : album.descriptionEn;
                
                return (
                  <div
                    key={album.id}
                    className="group cursor-pointer"
                    onClick={() => openLightbox(album)}
                  >
                    <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                      <img
                        src={album.coverImageUrl}
                        alt={title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-bold text-lg mb-1">{title}</h3>
                          <p className="text-sm">
                            {album.images.length} {i18n.language === 'ro' ? 'fotografii' : 'photos'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      {description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedAlbum} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          {selectedAlbum && (
            <div className="relative w-full h-full flex flex-col">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Image */}
              <div className="flex-1 relative flex items-center justify-center bg-black">
                <img
                  src={selectedAlbum.images[currentImageIndex]}
                  alt={`${i18n.language === 'ro' ? selectedAlbum.albumTitle : selectedAlbum.albumTitleEn} - ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {/* Navigation buttons */}
                {selectedAlbum.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Info bar */}
              <div className="bg-background p-4 border-t">
                <h3 className="font-bold text-lg">
                  {i18n.language === 'ro' ? selectedAlbum.albumTitle : selectedAlbum.albumTitleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentImageIndex + 1} / {selectedAlbum.images.length}
                </p>
                {(i18n.language === 'ro' ? selectedAlbum.description : selectedAlbum.descriptionEn) && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {i18n.language === 'ro' ? selectedAlbum.description : selectedAlbum.descriptionEn}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
