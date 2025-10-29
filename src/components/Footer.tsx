import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Facebook, Instagram } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t } = useTranslation();

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' },
    { key: 'news', path: '/news' },
    { key: 'gallery', path: '/gallery' },
    { key: 'contact', path: '/contact' },
  ];

  const legalItems = [
    { key: 'privacy', path: '/privacy-policy' },
    { key: 'terms', path: '/terms-conditions' },
    { key: 'health', path: '/health-safety' },
    { key: 'equality', path: '/equality-policy' },
    { key: 'volunteer', path: '/volunteer-code' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Romanian Flag Accent */}
      <div className="flag-gradient h-1 w-full"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column with Logo */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img 
                src={logo} 
                alt="Centrul de Cultură, Limbă și Tradiție Românească" 
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t('footer.contact')}
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:ccltrwellingborough@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span className="break-all">ccltrwellingborough@gmail.com</span>
              </a>
              <p className="text-sm text-muted-foreground">
                📍 Goldsmith Road, Wellingborough, NN8 3RU
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ {t('contact.info.scheduleValue')}
              </p>
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2">
              {legalItems.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(`footer.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
