import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
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
                <div className="relative">
                    <select
                        value={selectedLanguage || ''}
                        onChange={(e) => onSelect(e.target.value as Language)}
                        className="w-full appearance-none bg-white border-2 border-stone-200 rounded-lg px-4 py-3 pr-10 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors cursor-pointer"
                        aria-label="Select language"
                    >
                        <option value="" disabled>
                            Choose a language...
                        </option>
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name} ({lang.native})
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                </div>
                {selectedLanguage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            <span className="font-semibold">Selected:</span>{' '}
                            {languages.find((l) => l.code === selectedLanguage)?.name} (
                            {languages.find((l) => l.code === selectedLanguage)?.native})
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LanguageSelector;
