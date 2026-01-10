import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, Heart, Users, Calendar, Clock, MapPin, User, Newspaper } from 'lucide-react';
import logo from '@/assets/logo.png';
import { usePageTitle } from '@/lib/usePageTitle';
import { getGalleryAlbums, getNewsPosts, type GalleryAlbum, type NewsPost } from '@/lib/api';
import { formatDate, getCategoryColor } from '@/lib/utils';

const SHOW_OPENING_BANNER = true;

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  usePageTitle(undefined, { lang, includeTagline: true });

  const [latestPosts, setLatestPosts] = useState<NewsPost[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [latestAlbums, setLatestAlbums] = useState<GalleryAlbum[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLatestNews = async () => {
      setNewsLoading(true);
      try {
        const posts = await getNewsPosts(lang);
        const top = posts.filter((p) => p.published !== false).slice(0, 3);
        if (!cancelled) setLatestPosts(top);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    };

    fetchLatestNews();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    let cancelled = false;

    const fetchLatestAlbums = async () => {
      setGalleryLoading(true);
      try {
        const albums = await getGalleryAlbums(lang);
        const top = albums.filter((album) => album.published !== false).slice(0, 3);
        if (!cancelled) setLatestAlbums(top);
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    };

    fetchLatestAlbums();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const benefits = [
    {
      icon: BookOpen,
      title: t('home.benefits.language.title'),
      desc: t('home.benefits.language.desc'),
    },
    {
      icon: GraduationCap,
      title: t('home.benefits.education.title'),
      desc: t('home.benefits.education.desc'),
    },
    {
      icon: Heart,
      title: t('home.benefits.culture.title'),
      desc: t('home.benefits.culture.desc'),
    },
    {
      icon: Users,
      title: t('home.benefits.community.title'),
      desc: t('home.benefits.community.desc'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6TTAgNDhjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg md:text-xl mb-3 opacity-95">
              {t('home.hero.subtitle')}
            </p>
            <p className="text-base md:text-lg mb-6 text-secondary font-semibold">
              {t('brand.secondary')}
            </p>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
                <Link to="/enrolment">{t('home.hero.contactBtn')}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base font-semibold bg-white/10 hover:bg-white/20 border-white/30 text-white"
              >
                <a href="#program">{t('home.hero.scheduleBtn')}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {SHOW_OPENING_BANNER ? (
        <section className="py-8 md:py-10 bg-section-bg">
          <div className="container mx-auto px-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {t('home.openingBanner.title')}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t('home.openingBanner.body')}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="self-start md:self-auto">
                  <Link to="/news">{t('home.openingBanner.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      <section className="pb-6 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border bg-background/80 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {t('home.facebookCta.text')}
            </p>
            <Button asChild size="sm" variant="outline">
              <a
                href="https://www.facebook.com/scoalaromaneascawellingborough"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.facebookCta.button')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-10 md:py-14 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-8">
              {t('home.facts.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  icon: User,
                  label: t('home.facts.ageLabel'),
                  value: t('home.schedule.ageValue'),
                },
                {
                  icon: Clock,
                  label: t('home.facts.scheduleLabel'),
                  value: `${t('home.schedule.dayValue')} · ${t('home.schedule.timeValue')}`,
                },
                {
                  icon: MapPin,
                  label: t('home.facts.locationLabel'),
                  value: t('home.schedule.locationValue'),
                },
                {
                  icon: Calendar,
                  label: t('home.facts.startLabel'),
                  value: t('home.facts.startValue'),
                },
                {
                  icon: Users,
                  label: t('home.facts.contactLabel'),
                  value: t('home.facts.contactValue'),
                  href: '/contact',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <Card className="hover-lift h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.label}
                          </p>
                          <p className="text-sm text-muted-foreground leading-snug">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );

                return item.href ? (
                  <Link key={index} to={item.href} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              {t('home.what.title')}
            </h2>
            <div className="section-divider"></div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('home.what.content')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="hover-lift">
                  <CardContent className="p-6">
                    <p className="font-semibold text-foreground mb-2">
                      {t(`home.what.point${n}Title`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`home.what.point${n}Desc`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('home.benefits.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              // Define styles for each card based on index
              const cardStyles = [
                { bg: 'bg-primary', text: 'text-white', iconBg: 'bg-white/20' }, // Romanian Language - Blue
                { bg: 'bg-secondary', text: 'text-foreground', iconBg: 'bg-foreground/10' }, // Quality Education - Yellow
                { bg: 'bg-accent', text: 'text-white', iconBg: 'bg-white/20' }, // Culture & Traditions - Red
                { bg: '', text: 'text-white', iconBg: 'bg-white/20', logoBackground: true }, // Community - Logo background
              ];
              const style = cardStyles[index];
              
              return (
                <Card 
                  key={index} 
                  className={`hover-lift border-primary/20 overflow-hidden ${style.bg}`}
                  style={style.logoBackground ? {
                    backgroundImage: `linear-gradient(rgba(0, 43, 127, 0.85), rgba(0, 43, 127, 0.85)), url(${logo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 ${style.iconBg} rounded-full flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${style.text}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 ${style.text}`}>
                      {benefit.title}
                    </h3>
                    <p className={style.text}>{benefit.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="program" className="py-16 md:py-24 bg-muted/30 scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('home.schedule.title')}
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-lift">
              <CardContent className="p-6 flex items-start gap-4">
                <Calendar className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">{t('home.schedule.day')}</p>
                  <p className="text-muted-foreground">{t('home.schedule.dayValue')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6 flex items-start gap-4">
                <Clock className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">{t('home.schedule.time')}</p>
                  <p className="text-muted-foreground">{t('home.schedule.timeValue')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6 flex items-start gap-4">
                <User className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">{t('home.schedule.age')}</p>
                  <p className="text-muted-foreground">{t('home.schedule.ageValue')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6 flex items-start gap-4">
                <MapPin className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">{t('home.schedule.location')}</p>
                  <p className="text-muted-foreground">{t('home.schedule.locationValue')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="max-w-4xl mx-auto mt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t('home.schedule.calendarNote')}</p>
            <p className="text-sm text-muted-foreground">{t('home.schedule.paymentNote')}</p>
          </div>

          <div className="max-w-4xl mx-auto mt-10">
            <Card className="hover-lift">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                  {t('home.fees.title')}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{t('home.fees.cost')}</p>
                  <p>{t('home.fees.payment')}</p>
                  <p>{t('home.fees.stop')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder preview */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/20">
                      <User className="h-14 w-14 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {t('home.founder.title')}
                    </h2>
                    <p className="text-primary font-semibold mb-4">
                      {t('home.founder.name')}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {t('home.founder.preview')}
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/about">{t('home.founder.button')}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                {t('home.news.title')}
              </h2>
              <Button asChild variant="outline">
                <Link to="/news">{t('home.news.viewAll')}</Link>
              </Button>
            </div>

            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                      <div className="h-4 bg-muted rounded w-1/2 mb-6" />
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : latestPosts.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 mx-auto mb-5 bg-primary/10 rounded-full flex items-center justify-center">
                  <Newspaper className="h-10 w-10 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  {t('home.news.empty')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPosts.map((post) => {
                  const roTitle = post.originalTitleRo?.trim() || post.title?.trim() || post.titleEn?.trim() || '';
                  const roExcerpt = post.originalExcerptRo?.trim() || post.excerpt?.trim() || post.excerptEn?.trim() || '';
                  const title = lang === 'ro' ? roTitle : (post.titleEn?.trim() || roTitle);
                  const excerpt = lang === 'ro' ? roExcerpt : (post.excerptEn?.trim() || roExcerpt);

                  return (
                    <Card key={post.id} className="hover-lift overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(post.publicationDate, lang)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {excerpt}
                        </p>
                        <Button asChild size="sm">
                          <Link to={`/news/${post.slug}`}>
                            {t('home.news.readMore')}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('home.galleryPreview.title')}
          </h2>
          <div className="max-w-4xl mx-auto">
            {galleryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted/60 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : latestAlbums.length === 0 ? (
              <div className="mb-8 text-center">
                <p className="text-muted-foreground">
                  {t('gallery.empty.title')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {latestAlbums.map((album) => {
                  const roTitle = album.originalAlbumTitleRo?.trim() || album.albumTitle?.trim() || album.albumTitleEn?.trim() || '';
                  const title = lang === 'ro' ? roTitle : (album.albumTitleEn?.trim() || roTitle);
                  const fallbackTitle = title || t('home.galleryPreview.title');
                  const cover = album.coverImageUrl || '/news-placeholder.jpg';

                  return (
                    <Link
                      key={album.id}
                      to="/gallery"
                      className="group block"
                    >
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden hover-lift">
                        <img
                          src={cover}
                          alt={fallbackTitle}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src = '/news-placeholder.jpg';
                          }}
                        />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground line-clamp-2">
                        {fallbackTitle}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/gallery">{t('home.galleryPreview.viewBtn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-8">
            {t('home.testimonials.title')}
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            {t('home.testimonials.coming')}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 hero-gradient text-primary-foreground relative overflow-hidden">
        <div className="flag-gradient h-1 w-full absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-95">
              {t('home.cta.subtitle')}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
              <Link to="/enrolment">{t('home.cta.contactBtn')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
