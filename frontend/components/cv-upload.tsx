"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, Loader2, AlertCircle, X, CheckCircle, Zap } from 'lucide-react';
import { extractTextFromFile, parseCVWithGemini, ParsedCVData } from '@/lib/cv-parser';

interface CVUploadProps {
  onCVParsed: (data: ParsedCVData) => void;
  isLoading?: boolean;
}

export function CVUpload({ onCVParsed, isLoading = false }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const parseCV = async () => {
    if (!file) return;

    setParsing(true);
    setExtractionStep('Preparing to extract text...');
    
    try {
      setExtractionStep('Extracting text from your resume...');
      
      if (file.type === 'application/pdf') {
        setExtractionStep('Analyzing PDF content (this may take a moment)...');
      }
      
      const text = await extractTextFromFile(file);
      
      if (!text || text.trim().length < 100) {
        throw new Error('Insufficient text extracted. The file might be corrupted or image-based.');
      }

      setExtractionStep('Processing with AI to extract profile information...');
      const parsedData = await parseCVWithGemini(text, file.name);
      
      onCVParsed(parsedData);
      
      toast({
        title: "🎉 Resume Parsed Successfully!",
        description: `Extracted information from ${file.name}. Your profile has been auto-filled!`,
      });
      
      setFile(null);
    } catch (error) {
      console.error('CV parsing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      let errorTitle = 'Parsing Error';
      let suggestion = '';

      if (errorMessage.includes('text extracted')) {
        errorTitle = 'File Content Error';
        suggestion = 'Try converting your PDF to DOCX format or ensure the PDF has selectable text.';
      } else if (errorMessage.includes('OCR')) {
        errorTitle = 'OCR Processing Error';
        suggestion = 'The file might be image-based. Try using a text-based PDF or DOCX file.';
      } else if (errorMessage.includes('AI')) {
        errorTitle = 'AI Processing Error';
        suggestion = 'Please try again in a moment.';
      }
      
      toast({
        title: errorTitle,
        description: `${errorMessage} ${suggestion}`,
        variant: "destructive"
      });
    } finally {
      setParsing(false);
      setExtractionStep('');
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-3">
          <Zap className="h-7 w-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Auto-fill from Resume
        </h3>
        <p className="text-gray-600 text-sm max-w-sm mx-auto">
          Upload your resume and let our AI automatically extract and organize your information
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
            : file 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && document.getElementById('cv-upload')?.click()}
      >
        {file ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Remove file
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-3 bg-gray-100 rounded-full">
                <Upload className="h-10 w-10 text-gray-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Drop your resume here
              </p>
              <p className="text-gray-500 mb-3">
                or click to browse files
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
                <span>PDF</span>
                <span>•</span>
                <span>DOC</span>
                <span>•</span>
                <span>DOCX</span>
                <span>•</span>
                <span>Up to 10MB</span>
              </div>
            </div>
          </div>
        )}
        
        <Input
          id="cv-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {/* Action Buttons */}
      {file && (
        <div className="mt-6">
          <Button
            onClick={parseCV}
            disabled={parsing || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 h-auto text-base rounded-xl"
            size="lg"
          >
            {parsing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="space-y-2 w-full max-w-xs">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
                <span className="text-sm">Processing your resume...</span>
                {extractionStep && (
                  <span className="text-sm text-blue-100">{extractionStep}</span>
                )}
              </div>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Auto-fill my profile
              </>
            )}
          </Button>
        </div>
      )}

      {/* Enhanced Tips Section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for best results:</h4>
            <div className="space-y-1.5 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span><strong>DOCX files</strong> work best for accurate text extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span><strong>PDF files</strong> are processed using advanced OCR technology</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                <span>Ensure your resume has clear sections (Education, Experience, Skills)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
