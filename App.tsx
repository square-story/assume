import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, RefreshCcw, Sparkles, X, Loader2, PenTool, Github, Linkedin } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { analyzeResume } from './services/geminiService';
import { extractTextFromFile } from './services/textExtractor';
import { ResumeData } from './types';
import GradedView from './components/GradedView';
import ScoreStamp from './components/ScoreStamp';
import LanguageSelector, { Language } from './components/LanguageSelector';
import Button from './components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Drawer } from 'vaul';

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [data, setData] = useState<ResumeData | null>(null);
    const [textInput, setTextInput] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Show results drawer when data is available
    useEffect(() => {
        if (data && data.analysis) {
            setDrawerOpen(true);
        }
    }, [data]);

    const handleAnalyze = async () => {
        if (!textInput.trim() || !selectedLanguage) return;
        setLoading(true);
        setData(null);
        setDrawerOpen(false);

        try {
            const result = await analyzeResume(textInput, selectedLanguage);
            setData({
                text: textInput,
                analysis: result,
            });
        } catch (error) {
            alert('Failed to analyze resume. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setExtracting(true);
        try {
            const extractedText = await extractTextFromFile(file);
            setTextInput(extractedText);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to extract text from file');
            console.error(error);
        } finally {
            setExtracting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const reset = () => {
        setData(null);
        setTextInput('');
        setSelectedLanguage(null);
        setDrawerOpen(false);
    };

    return (
        <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-4 md:p-6 bg-white border-b border-stone-200 shadow-sm z-20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 md:w-6 md:h-6 text-ink-red flex-shrink-0" aria-hidden="true" />
                    <h1 className="text-lg md:text-2xl font-bold text-slate-800">Sarcastic Remarks</h1>
                </div>
                {data && (
                    <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)} aria-label="View results">
                        <FileText className="w-5 h-5" aria-hidden="true" />
                        <span className="ml-2 hidden sm:inline">View Results</span>
                    </Button>
                )}
            </header>

            {/* Main Content - Language Selection and PDF Upload */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Get Your Resume Graded</h2>
                        <p className="text-slate-600">Select your language and upload your resume PDF</p>
                    </div>

                    <LanguageSelector onSelect={setSelectedLanguage} selectedLanguage={selectedLanguage} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Upload Your Resume</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                role="button"
                                tabIndex={0}
                                aria-label="Upload resume file"
                                onClick={() => !extracting && fileInputRef.current?.click()}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !extracting) {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                className={`border-2 border-dashed border-stone-300 rounded-lg p-8 md:p-12 flex flex-col items-center justify-center text-center transition-colors ${extracting
                                    ? 'opacity-50 cursor-not-allowed bg-stone-50'
                                    : 'cursor-pointer hover:bg-stone-50 hover:border-stone-400'
                                    }`}
                            >
                                <Upload className="w-12 h-12 md:w-16 md:h-16 text-stone-400 mb-4" aria-hidden="true" />
                                <p className="text-slate-600 font-medium text-lg mb-2">Click to upload resume</p>
                                <p className="text-stone-400 text-sm">Supported: PDF, DOC, DOCX</p>
                                {extracting && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                        <span>Extracting text from document...</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileUpload}
                                aria-label="Resume file input"
                            />

                            {textInput && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <span className="font-semibold">✓ File uploaded successfully!</span>
                                        <span className="block mt-1 text-xs text-green-700">
                                            {textInput.length} characters extracted
                                        </span>
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || extracting || !textInput.trim() || !selectedLanguage}
                                className="w-full mt-4"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                                        Grading Resume...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                                        {!selectedLanguage
                                            ? 'Select Language First'
                                            : !textInput.trim()
                                                ? 'Upload Resume First'
                                                : 'Grade My Resume'}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Results Drawer - All Devices */}
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
                    <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[90%] md:h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50 focus-visible:outline-none">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="p-4 md:p-6 bg-white rounded-t-[10px] flex-shrink-0 border-b border-stone-200">
                                <div className="mx-auto w-12 h-1.5 flex-shrink-0 bg-stone-300 rounded-full mb-4" />
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Grading Results</h2>
                                    <Drawer.Close asChild>
                                        <Button variant="ghost" size="sm" aria-label="Close drawer">
                                            <X className="w-5 h-5" aria-hidden="true" />
                                        </Button>
                                    </Drawer.Close>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                                {data && data.analysis ? (
                                    <div className="max-w-4xl mx-auto space-y-6">
                                        {/* Score Stamp */}
                                        <div className="flex justify-center mb-6">
                                            <ScoreStamp grade={data.analysis.grade} score={data.analysis.score} />
                                        </div>

                                        {/* Teacher's Summary */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg md:text-xl">Teacher's Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="font-hand text-lg md:text-xl text-ink-red leading-snug">
                                                    &ldquo;{data.analysis.summary}&rdquo;
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Key Strengths */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                Key Strengths
                                            </h3>
                                            <ul className="space-y-2" role="list">
                                                {data.analysis.strengths.map((str, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-2 text-sm md:text-base text-slate-700 bg-green-50 p-3 md:p-4 rounded border border-green-100"
                                                    >
                                                        <span className="sr-only">Strength:</span>
                                                        <span>{str}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Mistake Breakdown */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                Mistake Breakdown
                                            </h3>
                                            <div className="space-y-2" role="list">
                                                {data.analysis.mistakes.map((mistake, i) => (
                                                    <div
                                                        key={i}
                                                        className="text-sm md:text-base p-3 md:p-4 rounded bg-red-50 border border-red-100"
                                                        role="listitem"
                                                    >
                                                        <span className="font-bold text-ink-red block mb-1">{mistake.type}</span>
                                                        <div className="space-y-1">
                                                            <span className="text-slate-600 line-through mr-2">{mistake.original}</span>
                                                            <span className="text-slate-800 font-medium">→ {mistake.correction}</span>
                                                        </div>
                                                        <p className="text-xs md:text-sm text-slate-600 mt-2">{mistake.explanation}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Graded Resume View */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg md:text-xl">Graded Resume</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="bg-stone-50 p-4 md:p-6 rounded-lg border border-stone-200">
                                                    <GradedView text={data.text} analysis={data.analysis} />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Reset Button */}
                                        <div className="pt-4 border-t border-stone-200">
                                            <Button onClick={reset} variant="outline" className="w-full" size="lg">
                                                <RefreshCcw className="w-5 h-5 mr-2" aria-hidden="true" />
                                                Grade Another Resume
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-400">No results available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            {/* Footer */}
            <footer className="flex-shrink-0 border-t border-stone-200 bg-white py-4 px-4 md:px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                        <p>&copy; {new Date().getFullYear()} Sarcastic Remarks. All rights reserved.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/square-story"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            aria-label="GitHub Profile"
                        >
                            <Github className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">GitHub</span>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/sadikkp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            aria-label="LinkedIn Profile"
                        >
                            <Linkedin className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">LinkedIn</span>
                        </a>
                    </div>
                </div>
            </footer>

            <Analytics />
        </div>
    );
};

export default App;
