import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/usePageTitle';

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ro' ? 'ro' : 'en';
  usePageTitle(t('legal.privacy.title'), { lang });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">{t('legal.privacy.title')}</h1>
      
      <Card className="p-8">
        <div className="space-y-6 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-2">
              {t('legal.privacy.orgName')}
            </p>
            <p>{t('legal.privacy.address')}</p>
            <p>{t('legal.privacy.effectiveDate')}</p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. {t('legal.privacy.section1Title')}</h2>
            <p>{t('legal.privacy.section1Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. {t('legal.privacy.section2Title')}</h2>
            <p>{t('legal.privacy.section2Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. {t('legal.privacy.section3Title')}</h2>
            <p>{t('legal.privacy.section3Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. {t('legal.privacy.section4Title')}</h2>
            <p>{t('legal.privacy.section4Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. {t('legal.privacy.section5Title')}</h2>
            <p>{t('legal.privacy.section5Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. {t('legal.privacy.section6Title')}</h2>
            <p>{t('legal.privacy.section6Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. {t('legal.privacy.section7Title')}</h2>
            <p>{t('legal.privacy.section7Content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. {t('legal.privacy.section8Title')}</h2>
            <p>{t('legal.privacy.section8Content')}</p>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
