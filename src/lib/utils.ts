import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, language: 'ro' | 'en'): string {
  const date = new Date(dateString);
  
  if (language === 'ro') {
    const months = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } else {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'Anunțuri':
    case 'Announcements':
      return 'bg-[#002B7F] text-white';
    case 'Evenimente':
    case 'Events':
      return 'bg-[#FCD116] text-[#CE1126]';
    case 'Activități':
    case 'Activities':
      return 'bg-[#CE1126] text-white';
    case 'Sărbători':
    case 'Holidays':
      return 'bg-[#FCD116] text-[#002B7F]';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
