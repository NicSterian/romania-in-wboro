import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

const EqualityPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">{t('legal.equality.title')}</h1>
      
      <Card className="p-8">
        <div className="space-y-6 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-2">
              {t('legal.equality.orgName')}
            </p>
            <p>{t('legal.equality.address')}</p>
            <p>{t('legal.equality.effectiveDate')}</p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. {t('legal.equality.section1Title')}</h2>
            <p>{t('legal.equality.section1Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. {t('legal.equality.section2Title')}</h2>
            <p>{t('legal.equality.section2Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. {t('legal.equality.section3Title')}</h2>
            <p>{t('legal.equality.section3Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. {t('legal.equality.section4Title')}</h2>
            <p>{t('legal.equality.section4Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. {t('legal.equality.section5Title')}</h2>
            <p>{t('legal.equality.section5Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. {t('legal.equality.section6Title')}</h2>
            <p>{t('legal.equality.section6Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. {t('legal.equality.section7Title')}</h2>
            <p>{t('legal.equality.section7Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. {t('legal.equality.section8Title')}</h2>
            <p>{t('legal.equality.section8Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. {t('legal.equality.section9Title')}</h2>
            <p>{t('legal.equality.section9Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. {t('legal.equality.section10Title')}</h2>
            <p>{t('legal.equality.section10Content')}</p>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default EqualityPolicy;
