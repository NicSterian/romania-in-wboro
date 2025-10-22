import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpg';

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

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-4">
          {/* Language Switcher - Top Right */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 border border-border rounded-lg p-1">
              <Button
                variant={i18n.language === 'ro' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('ro')}
                className="flex items-center gap-2"
              >
                <span className="text-xl">🇷🇴</span>
                <span className="text-sm font-medium">RO</span>
              </Button>
              <Button
                variant={i18n.language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('en')}
                className="flex items-center gap-2"
              >
                <span className="text-xl">🇬🇧</span>
                <span className="text-sm font-medium">EN</span>
              </Button>
            </div>
          </div>

          {/* Logo - Centered */}
          <Link to="/" className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="Școala Românească Mihai Eminescu Wellingborough" 
              className="h-32 w-auto"
            />
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
            <img 
              src={logo} 
              alt="Școala Românească Mihai Eminescu" 
              className="h-12 w-auto"
            />
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
                  <div className="flex gap-2">
                    <Button
                      variant={i18n.language === 'ro' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        changeLanguage('ro');
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 gap-2"
                    >
                      <span className="text-xl">🇷🇴</span>
                      <span>RO</span>
                    </Button>
                    <Button
                      variant={i18n.language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        changeLanguage('en');
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 gap-2"
                    >
                      <span className="text-xl">🇬🇧</span>
                      <span>EN</span>
                    </Button>
                  </div>
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
