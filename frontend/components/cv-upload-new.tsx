"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import { extractTextFromFile, parseCVWithGemini, ParsedCVData } from '@/lib/cv-parser';

interface CVUploadProps {
  onCVParsed: (data: ParsedCVData) => void;
  isLoading?: boolean;
}

export function CVUpload({ onCVParsed, isLoading = false }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
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
    
    try {
      const text = await extractTextFromFile(file);
      
      if (!text || text.trim().length < 100) {
        throw new Error('Insufficient text extracted. The file might be corrupted or image-based.');
      }

      const parsedData = await parseCVWithGemini(text, file.name);
      
      onCVParsed(parsedData);
      
      toast({
        title: "CV Parsed Successfully!",
        description: `Extracted information from ${file.name}. Review and edit the details below.`,
      });
      
      setFile(null);
    } catch (error) {
      console.error('CV parsing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorTitle = errorMessage.includes('text extracted') 
        ? 'File Content Error'
        : errorMessage.includes('AI')
        ? 'AI Processing Error'
        : 'Parsing Error';
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      {/* Header Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload your resume
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          Get started by uploading your resume. Our AI will auto-fill your profile.
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: PDF, DOC, DOCX (up to 10MB)
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : file 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && document.getElementById('cv-upload')?.click()}
      >
        {file ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <FileText className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
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
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                Choose file or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX files up to 10MB
              </p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50 border-gray-300"
            >
              Browse files
            </Button>
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
        <div className="mt-6 flex gap-3">
          <Button
            onClick={parseCV}
            disabled={parsing || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
          >
            {parsing ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span>Analyzing resume...</span>
              </div>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Auto-fill from resume
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Tips for best results:</p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>Use a well-formatted resume with clear sections</li>
              <li>Ensure text is selectable (not scanned images)</li>
              <li>Include contact info, education, experience, and skills</li>
              <li>DOCX format provides the most accurate parsing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
