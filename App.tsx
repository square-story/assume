import React, { useState, useRef } from 'react';
import { Upload, FileText, RefreshCcw, PenTool, Sparkles, Menu, X } from 'lucide-react';
import { analyzeResume } from './services/geminiService';
import { ResumeData } from './types';
import GradedView from './components/GradedView';
import ScoreStamp from './components/ScoreStamp';
import Button from './components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/Card';
import { Drawer } from 'vaul';

const SAMPLE_RESUME = `Jane Doe
Marketing Manager
Los Angeles, CA | jane.doe@email.com

Summary
Motivated individual with some experience in marketing. Looking for a good job where I can help a company grow. I am hard working and a team player.

Experience
Marketing Specialist, Company A (2020-Present)
- Responsible for social media.
- Helped with campaigns.
- Did a lot of writing for the blog.
- Talked to customers daily.

Intern, Company B (2019-2020)
- Assisted the team.
- Filed papers and stuff.
- Learnt how to use Excel.

Skills
- Microsoft Word
- Internet
- Communication
- Hard working
`;

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ResumeData | null>(null);
    const [inputMode, setInputMode] = useState<'upload' | 'text'>('text');
    const [textInput, setTextInput] = useState(SAMPLE_RESUME);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = async () => {
        if (!textInput.trim()) return;
        setLoading(true);
        setData(null);

        try {
            const result = await analyzeResume(textInput);
            setData({
                text: textInput,
                analysis: result,
            });
        } catch (error) {
            alert("Failed to analyze resume. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setTextInput(text);
            };
            reader.readAsText(file);
        }
    };

    const reset = () => {
        setData(null);
        setTextInput(SAMPLE_RESUME);
        setDrawerOpen(false);
    };

    return (
        <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-stone-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-ink-red" aria-hidden="true" />
                    <h1 className="text-lg font-bold text-slate-800">Resume Grader</h1>
                </div>
                {data && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="View feedback"
                        className="md:hidden"
                    >
                        <Menu className="w-5 h-5" aria-hidden="true" />
                    </Button>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex flex-col w-96 bg-white border-r border-stone-200 shadow-sm">
                    <div className="p-6 border-b border-stone-100 bg-stone-50">
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <PenTool className="text-ink-red w-6 h-6" aria-hidden="true" />
                            Resume Grader
                        </h1>
                        <p className="text-stone-500 text-sm mt-1">AI-powered critique & corrections</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!data ? (
                            <>
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        How would you like to submit?
                                    </label>
                                    <div className="flex gap-2" role="tablist" aria-label="Input method">
                                        <button
                                            role="tab"
                                            aria-selected={inputMode === 'text'}
                                            aria-controls="text-panel"
                                            onClick={() => setInputMode('text')}
                                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${inputMode === 'text'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                                                }`}
                                        >
                                            Paste Text
                                        </button>
                                        <button
                                            role="tab"
                                            aria-selected={inputMode === 'upload'}
                                            aria-controls="upload-panel"
                                            onClick={() => setInputMode('upload')}
                                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${inputMode === 'upload'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                                                }`}
                                        >
                                            Upload .txt
                                        </button>
                                    </div>
                                </div>

                                {inputMode === 'upload' ? (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Upload resume file"
                                        className="border-2 border-dashed border-stone-300 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-stone-50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                fileInputRef.current?.click();
                                            }
                                        }}
                                    >
                                        <Upload className="w-10 h-10 text-stone-400 mb-2" aria-hidden="true" />
                                        <p className="text-slate-600 font-medium">Click to upload resume</p>
                                        <p className="text-stone-400 text-xs mt-1">Supported formats: .txt, .md</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".txt,.md"
                                            onChange={handleFileUpload}
                                            aria-label="Resume file input"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full min-h-[300px]">
                                        <label htmlFor="resume-textarea" className="sr-only">
                                            Resume text input
                                        </label>
                                        <textarea
                                            id="resume-textarea"
                                            className="w-full flex-1 p-4 rounded-lg border border-stone-200 bg-stone-50 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
                                            placeholder="Paste your resume content here..."
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            aria-label="Resume text"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Teacher's Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-hand text-lg text-ink-red leading-snug">
                                            &ldquo;{data.analysis?.summary}&rdquo;
                                        </p>
                                    </CardContent>
                                </Card>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Key Strengths
                                    </h3>
                                    <ul className="space-y-2" role="list">
                                        {data.analysis?.strengths.map((str, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm text-slate-700 bg-green-50 p-3 rounded border border-green-100"
                                            >
                                                <span className="sr-only">Strength:</span>
                                                <span>{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Mistake Breakdown
                                    </h3>
                                    <div className="space-y-2" role="list">
                                        {data.analysis?.mistakes.slice(0, 5).map((mistake, i) => (
                                            <div
                                                key={i}
                                                className="text-xs p-3 rounded bg-red-50 border border-red-100"
                                                role="listitem"
                                            >
                                                <span className="font-bold text-ink-red block mb-1">{mistake.type}</span>
                                                <span className="text-slate-600 line-through mr-1">{mistake.original}</span>
                                                <span className="text-slate-800 font-medium">→ {mistake.correction}</span>
                                            </div>
                                        ))}
                                        {(data.analysis?.mistakes.length || 0) > 5 && (
                                            <p className="text-center text-xs text-stone-400 italic">
                                                + {(data.analysis?.mistakes.length || 0) - 5} more marks on paper
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-stone-200 bg-white">
                        {data ? (
                            <Button onClick={reset} variant="outline" className="w-full">
                                <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                                Grade Another
                            </Button>
                        ) : (
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !textInput.trim()}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                                        Grading...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                                        Grade My Resume
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </aside>

                {/* Mobile Drawer for Feedback */}
                <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <Drawer.Trigger asChild>
                        <span className="hidden" aria-hidden="true" />
                    </Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
                        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50 focus-visible:outline-none">
                            <div className="p-4 bg-white rounded-t-[10px] flex-1">
                                <div className="mx-auto w-12 h-1.5 flex-shrink-0 bg-stone-300 rounded-full mb-4" />
                                <div className="max-w-md mx-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-800">Feedback</h2>
                                        <Drawer.Close asChild>
                                            <Button variant="ghost" size="sm" aria-label="Close drawer">
                                                <X className="w-5 h-5" aria-hidden="true" />
                                            </Button>
                                        </Drawer.Close>
                                    </div>
                                    {data && (
                                        <div className="space-y-6 overflow-y-auto pb-8">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Teacher's Summary</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-hand text-lg text-ink-red leading-snug">
                                                        &ldquo;{data.analysis?.summary}&rdquo;
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <div>
                                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                    Key Strengths
                                                </h3>
                                                <ul className="space-y-2" role="list">
                                                    {data.analysis?.strengths.map((str, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-2 text-sm text-slate-700 bg-green-50 p-3 rounded border border-green-100"
                                                        >
                                                            <span>{str}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                    Mistake Breakdown
                                                </h3>
                                                <div className="space-y-2" role="list">
                                                    {data.analysis?.mistakes.slice(0, 5).map((mistake, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-xs p-3 rounded bg-red-50 border border-red-100"
                                                            role="listitem"
                                                        >
                                                            <span className="font-bold text-ink-red block mb-1">
                                                                {mistake.type}
                                                            </span>
                                                            <span className="text-slate-600 line-through mr-1">
                                                                {mistake.original}
                                                            </span>
                                                            <span className="text-slate-800 font-medium">
                                                                → {mistake.correction}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {(data.analysis?.mistakes.length || 0) > 5 && (
                                                        <p className="text-center text-xs text-stone-400 italic">
                                                            + {(data.analysis?.mistakes.length || 0) - 5} more marks on paper
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>

                {/* Main Content / Paper View */}
                <main className="flex-1 bg-stone-200/50 overflow-hidden relative flex flex-col">
                    <div
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                        aria-hidden="true"
                    />

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 paper-scroll">
                        <div className="max-w-3xl mx-auto min-h-[11in] bg-white shadow-2xl relative transition-all duration-500 ease-in-out transform">
                            <div
                                className="absolute inset-0 pointer-events-none opacity-10"
                                style={{
                                    backgroundImage: `linear-gradient(#000000 1px, transparent 1px)`,
                                    backgroundSize: '100% 2rem',
                                    marginTop: '2rem',
                                }}
                                aria-hidden="true"
                            />

                            <div
                                className="absolute left-16 top-0 bottom-0 w-px bg-red-200/50 hidden md:block"
                                aria-hidden="true"
                            />

                            <div className="relative p-6 md:p-16 md:pl-24">
                                {!data && !loading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 pointer-events-none">
                                        <FileText className="w-16 h-16 md:w-24 md:h-24 mb-4 opacity-50" aria-hidden="true" />
                                        <p className="font-hand text-2xl md:text-3xl">Ready to grade...</p>
                                    </div>
                                )}

                                {loading && (
                                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                                        <div className="animate-bounce mb-4" aria-hidden="true">
                                            <PenTool className="w-10 h-10 md:w-12 md:h-12 text-ink-red" />
                                        </div>
                                        <p className="font-hand text-xl md:text-2xl text-slate-600 animate-pulse">
                                            Reading carefully...
                                        </p>
                                        <span className="sr-only">Analyzing resume, please wait</span>
                                    </div>
                                )}

                                {data && data.analysis && (
                                    <div className="animate-fadeIn">
                                        <div className="absolute top-4 right-4 md:top-8 md:right-16 z-10 transform rotate-12">
                                            <ScoreStamp grade={data.analysis.grade} score={data.analysis.score} />
                                        </div>

                                        <GradedView text={data.text} analysis={data.analysis} />

                                        <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t-2 border-ink-red/20 font-hand text-ink-red text-lg md:text-xl transform -rotate-1">
                                            <p className="font-bold mb-2">Teacher's Remarks:</p>
                                            <p>{data.analysis.summary}</p>
                                            <div className="mt-4 flex justify-end">
                                                <div className="border-b border-ink-red w-32" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-6 md:mt-8 pb-4 text-stone-400 text-xs">
                            <p>AI can make mistakes. Always review corrections yourself.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
