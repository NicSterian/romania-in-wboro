import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

const HealthSafety = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">{t('legal.health.title')}</h1>
      
      <Card className="p-8">
        <div className="space-y-6 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-2">
              {t('legal.health.orgName')}
            </p>
            <p>{t('legal.health.address')}</p>
            <p>{t('legal.health.effectiveDate')}</p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. {t('legal.health.section1Title')}</h2>
            <p>{t('legal.health.section1Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. {t('legal.health.section2Title')}</h2>
            <p>{t('legal.health.section2Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. {t('legal.health.section3Title')}</h2>
            <p>{t('legal.health.section3Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. {t('legal.health.section4Title')}</h2>
            <p>{t('legal.health.section4Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. {t('legal.health.section5Title')}</h2>
            <p>{t('legal.health.section5Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. {t('legal.health.section6Title')}</h2>
            <p>{t('legal.health.section6Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. {t('legal.health.section7Title')}</h2>
            <p>{t('legal.health.section7Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. {t('legal.health.section8Title')}</h2>
            <p>{t('legal.health.section8Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. {t('legal.health.section9Title')}</h2>
            <p>{t('legal.health.section9Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. {t('legal.health.section10Title')}</h2>
            <p>{t('legal.health.section10Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">11. {t('legal.health.section11Title')}</h2>
            <p>{t('legal.health.section11Content')}</p>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default HealthSafety;
