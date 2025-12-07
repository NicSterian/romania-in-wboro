import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, Heart, Users, Calendar, Clock, MapPin, User } from 'lucide-react';
import logo from '@/assets/logo.png';

const Home = () => {
  const { t } = useTranslation();

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
            <p className="text-xl md:text-2xl mb-4 font-semibold text-secondary">
              {t('home.hero.subtitle')}
            </p>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
                <Link to="/enrolment">{t('home.hero.contactBtn')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base font-semibold bg-white/10 hover:bg-white/20 border-white/30 text-white">
                <Link to="/about">{t('home.hero.learnBtn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              {t('home.about.title')}
            </h2>
            <div className="section-divider"></div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('home.about.content')}
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">{t('home.about.readMore')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
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
      <section className="py-16 md:py-24 bg-section-bg">
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
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('home.galleryPreview.title')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg overflow-hidden hover-lift"
                >
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-6xl">📸</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/gallery">{t('home.galleryPreview.viewBtn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-section-bg">
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
      <section className="py-16 md:py-24 flag-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
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
