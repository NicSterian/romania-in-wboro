import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getGalleryAlbumBySlug, type GalleryAlbum } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePageTitle } from '@/lib/usePageTitle';

const GalleryAlbumPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  const decodedSlug = useMemo(() => {
    if (!slug) return '';
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  }, [slug]);
  const normalizedSlug = decodedSlug.trim();

  const [album, setAlbum] = useState<GalleryAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxLoading, setLightboxLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const albumTitle = useMemo(() => {
    if (!album) return '';
    const roTitle = album.originalAlbumTitleRo?.trim() || album.albumTitle?.trim() || album.albumTitleEn?.trim() || '';
    return lang === 'ro' ? roTitle : (album.albumTitleEn?.trim() || roTitle);
  }, [album, lang]);

  const albumDescription = useMemo(() => {
    if (!album) return '';
    const roDescription = album.originalDescriptionRo?.trim() || album.description?.trim() || album.descriptionEn?.trim() || '';
    return lang === 'ro' ? roDescription : (album.descriptionEn?.trim() || roDescription);
  }, [album, lang]);

  usePageTitle(albumTitle || t('nav.gallery'), { lang });

  useEffect(() => {
    let cancelled = false;

    const fetchAlbum = async () => {
      if (!normalizedSlug) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const data = await getGalleryAlbumBySlug(normalizedSlug, lang);
        if (!cancelled) {
          if (data) {
            setAlbum(data);
          } else {
            setError(true);
            setAlbum(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(true);
          setAlbum(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAlbum();

    return () => {
      cancelled = true;
    };
  }, [normalizedSlug, lang]);

  useEffect(() => {
    if (lightboxOpen) {
      setLightboxLoading(true);
    }
  }, [lightboxOpen, currentImageIndex]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setLightboxLoading(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    dragState.current = null;
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
    setLightboxLoading(false);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    dragState.current = null;
  };

  const nextImage = () => {
    if (!album || album.images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === album.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!album || album.images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? album.images.length - 1 : prev - 1
    );
  };

  const resetZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    dragState.current = null;
  }, []);

  const clampScale = useCallback((value: number) => Math.min(4, Math.max(1, value)), []);

  const updateScale = useCallback((nextScale: number) => {
    const clamped = clampScale(nextScale);
    setScale(clamped);
    if (clamped === 1) {
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
      dragState.current = null;
    }
  }, [clampScale]);

  const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (!lightboxOpen) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    updateScale(scale + direction * 0.1);
  }, [lightboxOpen, scale, updateScale]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
  }, [scale, offset]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  }, []);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore release errors if capture was not set.
    }
    dragState.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    resetZoom();
  }, [currentImageIndex, lightboxOpen, resetZoom]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            {albumTitle || t('gallery.hero')}
          </h1>
          {albumDescription && (
            <p className="text-lg md:text-xl opacity-90 mt-4 max-w-3xl mx-auto">
              {albumDescription}
            </p>
          )}
        </div>
      </section>

      {/* Album Content */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/gallery">{t('nav.gallery')}</Link>
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error || !album ? (
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                {i18n.language === 'ro'
                  ? 'Ne pare rău, albumul nu a fost găsit.'
                  : 'Sorry, the album could not be found.'}
              </p>
            </div>
          ) : album.images.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                {i18n.language === 'ro'
                  ? 'Acest album nu are încă imagini.'
                  : 'This album has no images yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {album.images.map((image, index) => {
                const imageUrl = image.url || '/news-placeholder.jpg';
                const imageAlt = image.alt?.trim() || albumTitle || t('gallery.hero');

                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    className="group relative overflow-hidden rounded-lg bg-muted hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-44 md:h-48"
                      onError={(event) => {
                        event.currentTarget.src = '/news-placeholder.jpg';
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog
        open={lightboxOpen}
        onOpenChange={(open) => {
          if (!open) closeLightbox();
        }}
      >
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden">
          {album && album.images.length > 0 && (() => {
            const currentImage = album.images[currentImageIndex];
            const imageUrl = currentImage?.url || '/news-placeholder.jpg';
            const imageAlt = currentImage?.alt?.trim() || `${albumTitle || t('gallery.hero')} - ${currentImageIndex + 1}`;
            const imageCaption = currentImage?.caption?.trim();
            const imageCount = album.images.length;
            const displayIndex = imageCount === 0 ? 0 : currentImageIndex + 1;

            return (
              <div className="relative w-full h-full flex flex-col min-h-0">
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div
                  className={`flex-1 relative flex items-center justify-center bg-black min-h-0 overflow-hidden ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                  onWheel={handleWheel}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onDoubleClick={resetZoom}
                >
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="block max-h-full max-w-full object-contain object-center h-auto w-auto"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                      transformOrigin: 'center',
                      transition: isDragging ? 'none' : 'transform 150ms ease',
                    }}
                    onLoad={() => setLightboxLoading(false)}
                    onError={(e) => {
                      e.currentTarget.src = '/news-placeholder.jpg';
                      setLightboxLoading(false);
                    }}
                  />
                  {lightboxLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </div>
                  )}

                  {imageCount > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                <div className="absolute top-4 right-16 z-50 flex items-center gap-2">
                  <button
                    onClick={() => updateScale(scale + 0.25)}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-1 text-sm transition-colors"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateScale(scale - 0.25)}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-1 text-sm transition-colors"
                    aria-label="Zoom out"
                  >
                    -
                  </button>
                  <button
                    onClick={resetZoom}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-1 text-xs transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <div className="bg-background p-4 border-t">
                  <h3 className="font-bold text-lg">{albumTitle || t('gallery.hero')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {displayIndex} / {imageCount}
                  </p>
                  {imageCaption ? (
                    <p className="text-sm text-muted-foreground mt-2">{imageCaption}</p>
                  ) : albumDescription ? (
                    <p className="text-sm text-muted-foreground mt-2">{albumDescription}</p>
                  ) : null}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryAlbumPage;
