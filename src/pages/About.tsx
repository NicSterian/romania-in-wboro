import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Landmark, Heart, Palette, Calendar, Clock, MapPin, User } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const About = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  usePageTitle(t('nav.about'), { lang });

  const subjects = [
    {
      icon: BookOpen,
      title: t('about.subjects.language.title'),
      desc: t('about.subjects.language.desc'),
    },
    {
      icon: Landmark,
      title: t('about.subjects.history.title'),
      desc: t('about.subjects.history.desc'),
    },
    {
      icon: Heart,
      title: t('about.subjects.culture.title'),
      desc: t('about.subjects.culture.desc'),
    },
    {
      icon: Palette,
      title: t('about.subjects.arts.title'),
      desc: t('about.subjects.arts.desc'),
    },
  ];

  const communities = [
    'Wellingborough',
    'Northampton',
    'Kettering',
    'Rushden',
    'Higham Ferrers',
    'Finedon',
    'Irthlingborough',
    'Burton Latimer',
    'Corby',
    'Rothwell',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center">
            {t('about.hero')}
          </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
              {t('about.mission.title')}
            </h2>
            <div className="section-divider"></div>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>{t('about.mission.content1')}</p>
              <p>{t('about.mission.content2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Name / Identity Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
              {t('about.identity.title')}
            </h2>
            <div className="section-divider"></div>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>{t('about.identity.content1')}</p>
              <p>{t('about.identity.content2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('about.curriculum.title')}
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t('about.curriculum.ageLabel')}</h3>
                <p className="text-muted-foreground">{t('about.curriculum.age')}</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t('about.curriculum.scheduleLabel')}</h3>
                <p className="text-muted-foreground">{t('about.curriculum.schedule')}</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t('about.curriculum.locationLabel')}</h3>
                <p className="text-muted-foreground">{t('about.curriculum.location')}</p>
              </CardContent>
            </Card>
          </div>
          <p className="max-w-3xl mx-auto mt-8 text-center text-sm text-muted-foreground">
            {t('about.curriculum.calendarNote')}
          </p>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('about.subjects.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {subjects.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <Card key={index} className="hover-lift border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {subject.title}
                    </h3>
                    <p className="text-muted-foreground">{subject.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('about.founder.sectionTitle')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/20">
                      <User className="h-24 w-24 text-primary" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {t('about.founder.name')}
                    </h3>
                    <p className="text-primary font-semibold mb-6">
                      {t('about.founder.role')}
                    </p>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>{t('about.founder.p1')}</p>
                      <p>{t('about.founder.p2')}</p>
                      <p>{t('about.founder.p3')}</p>

                      <div className="pt-2">
                        <p className="font-semibold text-foreground mb-2">
                          {t('about.founder.principlesTitle')}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>{t('about.founder.principle1')}</li>
                          <li>{t('about.founder.principle2')}</li>
                          <li>{t('about.founder.principle3')}</li>
                        </ul>
                      </div>

                      <p>{t('about.founder.p4')}</p>

                      <div className="pt-2">
                        <p className="font-semibold text-foreground mb-2">
                          {t('about.founder.visionTitle')}
                        </p>
                        <p>{t('about.founder.vision')}</p>
                      </div>

                      <div className="pt-2">
                        <p className="font-semibold text-foreground mb-2">
                          {t('about.founder.offerTitle')}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>{t('about.founder.offer1')}</li>
                          <li>{t('about.founder.offer2')}</li>
                          <li>{t('about.founder.offer3')}</li>
                        </ul>
                      </div>

                      {t('about.founder.p5') ? <p>{t('about.founder.p5')}</p> : null}

                      <div className="pt-2 text-foreground">
                        <p className="font-semibold">{t('about.founder.closing1')}</p>
                        <p className="font-semibold">{t('about.founder.closing2')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Serving Areas Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t('about.areas.title')}
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {communities.map((community, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                >
                  {community}
                </span>
              ))}
            </div>
            <div className="text-center">
              <Button asChild size="lg" variant="default">
                <Link to="/contact">{t('about.areas.contactBtn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
