import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const WhatsAppWidget = () => {
  const { t, i18n } = useTranslation();

  const handleWhatsAppClick = () => {
    const phone = '447494673740'; // UK format without +
    const messageRo =
      'Bună ziua! Aș dori mai multe informații despre Școala Românească Wellingborough.';
    const messageEn =
      'Hello! I would like more information about Scoala Romaneasca Wellingborough.';

    const text = i18n.language === 'ro' ? messageRo : messageEn;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleWhatsAppClick}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 animate-scale-in"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card border-border">
          <p className="text-sm">{t('whatsapp.tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WhatsAppWidget;
