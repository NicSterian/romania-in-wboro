import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Users, Calendar, HelpCircle } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const Enrolment = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  usePageTitle(t('nav.enrolment'), { lang });

  const steps = [
    {
      icon: FileText,
      title: t('enrolment.steps.form.title'),
      desc: t('enrolment.steps.form.desc'),
    },
    {
      icon: Users,
      title: t('enrolment.steps.child.title'),
      desc: t('enrolment.steps.child.desc'),
    },
    {
      icon: Calendar,
      title: t('enrolment.steps.start.title'),
      desc: t('enrolment.steps.start.desc'),
    },
  ];

  const faqs = [
    {
      question: t('enrolment.faq.q1'),
      answer: t('enrolment.faq.a1'),
    },
    {
      question: t('enrolment.faq.q2'),
      answer: t('enrolment.faq.a2'),
    },
    {
      question: t('enrolment.faq.q3'),
      answer: t('enrolment.faq.a3'),
    },
    {
      question: t('enrolment.faq.q4'),
      answer: t('enrolment.faq.a4'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('enrolment.hero.title')}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {t('enrolment.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* How it works + Form */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Steps */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                {t('enrolment.steps.title')}
              </h2>
              <div className="section-divider mb-6" />
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Card key={index} className="hover-lift">
                      <CardContent className="p-6 flex gap-4 items-start">
                        <div className="mt-1">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <span>{t('enrolment.note')}</span>
                </div>
                <Button asChild size="lg" className="w-full md:w-auto">
                  <a
                    href="https://form.jotform.com/253456383649065"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('enrolment.ctaButton')}
                  </a>
                </Button>
              </div>

              <Card className="mt-6 hover-lift border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('enrolment.afterSubmit.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('enrolment.afterSubmit.content')}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t('enrolment.afterSubmit.ageNote')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Embedded form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                {t('enrolment.form.title')}
              </h2>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] w-full">
                    <iframe
                      src="https://form.jotform.com/253456383649065"
                      title="Formular de înscriere"
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
              <p className="mt-3 text-xs text-muted-foreground">
                {t('enrolment.form.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 flex items-center gap-2">
              <HelpCircle className="h-7 w-7" />
              <span>{t('enrolment.faq.title')}</span>
            </h2>
            <div className="section-divider mb-6" />
            <div className="space-y-4">
              {faqs.map((item, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-5">
                    <p className="font-semibold text-foreground mb-2">
                      {item.question}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">{t('enrolment.faq.contactLink')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Enrolment;
