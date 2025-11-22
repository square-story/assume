import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker - use local file from public directory
if (typeof window !== 'undefined') {
    // Use local worker file (copied to public directory during build)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
        // Handle PDF files
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            try {
                const arrayBuffer = await file.arrayBuffer();

                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    verbosity: 0, // Suppress console warnings
                });

                const pdf = await loadingTask.promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    try {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item: any) => item.str || '')
                            .join(' ')
                            .trim();
                        if (pageText) {
                            fullText += pageText + '\n\n';
                        }
                    } catch (pageError) {
                        console.warn(`Error extracting text from page ${i}:`, pageError);
                        // Continue with other pages
                    }
                }

                const extractedText = fullText.trim();
                if (!extractedText) {
                    throw new Error(
                        'No text could be extracted from the PDF. The file might be image-based or corrupted.'
                    );
                }
                return extractedText;
            } catch (pdfError) {
                if (pdfError instanceof Error) {
                    // Check if it's a worker loading error
                    if (
                        pdfError.message.includes('worker') ||
                        pdfError.message.includes('fetch') ||
                        pdfError.message.includes('imported module') ||
                        pdfError.message.includes('Setting up fake worker')
                    ) {
                        throw new Error(
                            'PDF extraction failed: Unable to load PDF worker. Please try using a DOCX file instead, or ensure the worker file is accessible.'
                        );
                    }
                    throw new Error(`PDF extraction failed: ${pdfError.message}`);
                }
                throw new Error('Failed to extract text from PDF file');
            }
        }

        // Handle DOCX files
        if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.docx')
        ) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                const extractedText = result.value.trim();
                if (!extractedText) {
                    throw new Error('No text could be extracted from the DOCX file.');
                }
                return extractedText;
            } catch (docxError) {
                if (docxError instanceof Error) {
                    throw new Error(`DOCX extraction failed: ${docxError.message}`);
                }
                throw new Error('Failed to extract text from DOCX file');
            }
        }

        // Handle DOC files (older format - limited support)
        if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
            // DOC files are binary and harder to parse client-side
            // We'll try to read as text first, but this may not work well
            try {
                const text = await file.text();
                if (text.trim().length > 0 && !text.includes('PK')) {
                    // If it doesn't look like a zip file (DOCX), try as text
                    return text.trim();
                }
            } catch (e) {
                // Fall through to error
            }
            throw new Error(
                'DOC file format is not fully supported. Please convert to DOCX or PDF for better results.'
            );
        }

        // Handle plain text files
        if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            const text = await file.text();
            if (!text.trim()) {
                throw new Error('The text file appears to be empty.');
            }
            return text.trim();
        }

        throw new Error(
            `Unsupported file type: ${fileType || 'unknown'}. Please upload PDF, DOCX, DOC, TXT, or MD files.`
        );
    } catch (error) {
        if (error instanceof Error) {
            throw error; // Re-throw with original message
        }
        throw new Error('Failed to extract text from file');
    }
};
