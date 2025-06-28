
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full p-1">
      <Button
        onClick={() => onLanguageChange('ar')}
        variant={language === 'ar' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-full text-sm font-medium transition-all duration-300 ${
          language === 'ar' 
            ? 'bg-white text-gray-800 shadow-md' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        <Globe className="w-4 h-4 ml-1" />
        العربية
      </Button>
      <Button
        onClick={() => onLanguageChange('en')}
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-full text-sm font-medium transition-all duration-300 ${
          language === 'en' 
            ? 'bg-white text-gray-800 shadow-md' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        English
      </Button>
    </div>
  );
};

export default LanguageToggle;
