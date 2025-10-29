import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

const VolunteerCode = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">{t('legal.volunteer.title')}</h1>
      
      <Card className="p-8">
        <div className="space-y-6 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-2">
              {t('legal.volunteer.orgName')}
            </p>
            <p>{t('legal.volunteer.address')}</p>
            <p>{t('legal.volunteer.effectiveDate')}</p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. {t('legal.volunteer.section1Title')}</h2>
            <p>{t('legal.volunteer.section1Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. {t('legal.volunteer.section2Title')}</h2>
            <p>{t('legal.volunteer.section2Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. {t('legal.volunteer.section3Title')}</h2>
            <p>{t('legal.volunteer.section3Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. {t('legal.volunteer.section4Title')}</h2>
            <p>{t('legal.volunteer.section4Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. {t('legal.volunteer.section5Title')}</h2>
            <p>{t('legal.volunteer.section5Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. {t('legal.volunteer.section6Title')}</h2>
            <p>{t('legal.volunteer.section6Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. {t('legal.volunteer.section7Title')}</h2>
            <p>{t('legal.volunteer.section7Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. {t('legal.volunteer.section8Title')}</h2>
            <p>{t('legal.volunteer.section8Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. {t('legal.volunteer.section9Title')}</h2>
            <p>{t('legal.volunteer.section9Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. {t('legal.volunteer.section10Title')}</h2>
            <p>{t('legal.volunteer.section10Content')}</p>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default VolunteerCode;
