import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' },
    { key: 'news', path: '/news' },
    { key: 'gallery', path: '/gallery' },
    { key: 'contact', path: '/contact' },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ro' ? 'en' : 'ro';
    i18n.changeLanguage(newLang);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-4">
          {/* Language Switcher - Top Right */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <span className="text-2xl">{i18n.language === 'ro' ? '🇷🇴' : '🇬🇧'}</span>
              <span className="text-sm font-medium">{i18n.language === 'ro' ? 'RO' : 'EN'}</span>
            </Button>
          </div>

          {/* Logo - Centered */}
          <Link to="/" className="flex justify-center mb-6">
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                Școala Românească
              </h1>
              <p className="text-lg font-semibold text-accent">Mihai Eminescu</p>
              <p className="text-sm text-muted-foreground">Wellingborough, UK</p>
            </div>
          </Link>

          {/* Navigation - Below Logo */}
          <nav className="flex justify-center">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 ${
                      isActive(item.path)
                        ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                        : 'text-foreground/80'
                    }`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center">
            <div>
              <h1 className="text-lg font-bold text-primary">Școala Românească</h1>
              <p className="text-xs font-semibold text-accent">Mihai Eminescu</p>
            </div>
          </Link>

          {/* Hamburger Menu - Right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-primary"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card animate-slide-in-right">
            <nav className="container mx-auto px-4 py-6">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 text-base font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-primary'
                          : 'text-foreground/80 hover:text-primary'
                      }`}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
                <li className="pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleLanguage();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2"
                  >
                    <span className="text-2xl">{i18n.language === 'ro' ? '🇬🇧' : '🇷🇴'}</span>
                    <span>Switch to {i18n.language === 'ro' ? 'English' : 'Română'}</span>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
