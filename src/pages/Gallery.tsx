import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';

const Gallery = () => {
  const { t } = useTranslation();

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

      {/* Empty State */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              {t('gallery.empty.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('gallery.empty.subtitle')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
