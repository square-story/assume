# Sarcastic Remarks 🎓

An AI-powered resume critique tool that provides brutally honest feedback in multiple languages. Get your resume graded like a strict teacher marking an answer sheet with red ink corrections, grades, and actionable feedback.

🌐 **Live Site:** [sarcastic-remarks.vercel.app](https://sarcastic-remarks.vercel.app)

## Features

- 📄 **Multi-format Support**: Upload PDF, DOCX, or DOC files
- 🌍 **Multi-language Feedback**: Choose from 8 languages (English, Malayalam, Hindi, Spanish, French, German, Japanese, Chinese)
- 🎯 **Brutal Honesty**: Get brutally honest, teacher-style feedback with corrections
- 📊 **Detailed Analysis**: 
  - Letter grade (A+ to F)
  - Score out of 100
  - Key strengths
  - Mistake breakdown with corrections
  - Highlighted errors in your resume
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- 🎨 **Beautiful UI**: Paper-style interface with red ink corrections

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui patterns + Vaul drawer
- **AI**: Google Gemini 2.5 Flash
- **PDF Processing**: pdfjs-dist
- **DOCX Processing**: mammoth
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/square-story/sarcastic-remarks.git
cd sarcastic-remarks
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
sarcastic-remarks/
├── components/          # React components
│   ├── ui/             # UI primitives (Button, Card)
│   ├── GradedView.tsx  # Resume display with highlighted mistakes
│   ├── LanguageSelector.tsx
│   ├── MistakeTooltip.tsx
│   └── ScoreStamp.tsx
├── services/           # Business logic
│   ├── geminiService.ts    # AI analysis service
│   └── textExtractor.ts    # PDF/DOCX text extraction
├── public/             # Static assets
│   └── pdf.worker.min.mjs  # PDF.js worker
├── App.tsx             # Main application component
└── types.ts            # TypeScript type definitions
```

## How It Works

1. **Select Language**: Choose your preferred language for feedback
2. **Upload Resume**: Upload your resume as PDF, DOCX, or DOC
3. **AI Analysis**: The AI analyzes your resume using Gemini
4. **Get Feedback**: Receive detailed feedback with:
   - Grade and score
   - Teacher's summary
   - Key strengths
   - Mistake breakdown with corrections
   - Highlighted errors in your resume

## Supported Languages

- English
- Malayalam (മലയാളം)
- Hindi (हिन्दी)
- Spanish (Español)
- French (Français)
- German (Deutsch)
- Japanese (日本語)
- Chinese (中文)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Author

**square-story**

- GitHub: [@square-story](https://github.com/square-story)
- LinkedIn: [sadikkp](https://www.linkedin.com/in/sadikkp)

## Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- UI inspired by teacher grading papers
- Powered by [Vercel](https://vercel.com)

---

Made with ❤️ and a bit of sarcasm
