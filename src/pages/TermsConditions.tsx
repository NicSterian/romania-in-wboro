import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/usePageTitle';

const TermsConditions = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  usePageTitle(t('legal.terms.title'), { lang });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">{t('legal.terms.title')}</h1>
      
      <Card className="p-8">
        <div className="space-y-6 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-2">
              {t('legal.terms.orgName')}
            </p>
            <p>{t('legal.terms.address')}</p>
            <p>{t('legal.terms.effectiveDate')}</p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. {t('legal.terms.section1Title')}</h2>
            <p>{t('legal.terms.section1Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. {t('legal.terms.section2Title')}</h2>
            <p>{t('legal.terms.section2Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. {t('legal.terms.section3Title')}</h2>
            <p>{t('legal.terms.section3Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. {t('legal.terms.section4Title')}</h2>
            <p>{t('legal.terms.section4Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. {t('legal.terms.section5Title')}</h2>
            <p>{t('legal.terms.section5Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. {t('legal.terms.section6Title')}</h2>
            <p>{t('legal.terms.section6Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. {t('legal.terms.section7Title')}</h2>
            <p>{t('legal.terms.section7Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. {t('legal.terms.section8Title')}</h2>
            <p>{t('legal.terms.section8Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. {t('legal.terms.section9Title')}</h2>
            <p>{t('legal.terms.section9Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. {t('legal.terms.section10Title')}</h2>
            <p>{t('legal.terms.section10Content')}</p>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default TermsConditions;
