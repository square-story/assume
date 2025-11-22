import React from 'react';
import { Globe } from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

export type Language = 'english' | 'malayalam' | 'hindi' | 'spanish' | 'french' | 'german' | 'japanese' | 'chinese';

interface LanguageSelectorProps {
    onSelect: (language: Language) => void;
    selectedLanguage: Language | null;
}

const languages: { code: Language; name: string; native: string }[] = [
    { code: 'english', name: 'English', native: 'English' },
    { code: 'malayalam', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'hindi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'spanish', name: 'Spanish', native: 'Español' },
    { code: 'french', name: 'French', native: 'Français' },
    { code: 'german', name: 'German', native: 'Deutsch' },
    { code: 'japanese', name: 'Japanese', native: '日本語' },
    { code: 'chinese', name: 'Chinese', native: '中文' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, selectedLanguage }) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-ink-red" aria-hidden="true" />
                    <CardTitle className="text-lg">Select Your Language</CardTitle>
                </div>
                <CardDescription>
                    Choose the language for brutal feedback. You must select a language before grading.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelect(lang.code)}
                            className={`
                p-4 rounded-lg border-2 transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
                ${selectedLanguage === lang.code
                                    ? 'border-ink-red bg-red-50 text-ink-red font-semibold'
                                    : 'border-stone-200 bg-white text-slate-700 hover:border-stone-300 hover:bg-stone-50'
                                }
              `}
                            aria-pressed={selectedLanguage === lang.code}
                            aria-label={`Select ${lang.name} language`}
                        >
                            <div className="text-sm font-medium">{lang.name}</div>
                            <div className="text-xs text-stone-500 mt-1">{lang.native}</div>
                        </button>
                    ))}
                </div>
                {selectedLanguage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            <span className="font-semibold">Selected:</span> {languages.find((l) => l.code === selectedLanguage)?.name}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LanguageSelector;

