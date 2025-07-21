"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, Loader2, AlertCircle, X, Download, CheckCircle } from 'lucide-react';
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
        description: "Please upload a PDF, DOCX, or TXT file",
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

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const parseCV = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CV file to parse",
        variant: "destructive"
      });
      return;
    }

    setParsing(true);
    try {
      toast({
        title: "Processing CV...",
        description: "Extracting text from your file...",
      });

      const fileContent = await extractTextFromFile(file);
      
      if (fileContent.length < 20) {
        throw new Error('The file appears to be empty or contains no readable text. Please try a different file format.');
      }

      console.log('Extracted text length:', fileContent.length);
      console.log('Text preview:', fileContent.substring(0, 200) + '...');

      toast({
        title: "Text extracted successfully!",
        description: "Now analyzing content with AI...",
      });

      const parsedData = await parseCVWithGemini(fileContent, file.name);
      
      onCVParsed(parsedData);
      
      toast({
        title: "CV parsed successfully! 🎉",
        description: `Extracted ${parsedData.education?.length || 0} education entries, ${parsedData.experience?.length || 0} work experiences, ${parsedData.projects?.length || 0} projects, and ${parsedData.skills?.length || 0} skills.`,
      });
    } catch (error: any) {
      console.error('Error parsing CV:', error);
      
      let errorMessage = "Please try again or fill the form manually";
      let errorTitle = "Failed to parse CV";
      
      if (error.message.includes('worker')) {
        errorTitle = "PDF Processing Issue";
        errorMessage = "PDF worker failed to load. Please try uploading a DOCX or TXT file instead.";
      } else if (error.message.includes('image-based')) {
        errorTitle = "Scanned PDF Detected";
        errorMessage = "This appears to be a scanned PDF. Please upload a text-based PDF, DOCX, or TXT file.";
      } else if (error.message.includes('password')) {
        errorTitle = "Password Protected";
        errorMessage = "This PDF is password protected. Please upload an unprotected version.";
      } else if (error.message.includes('empty')) {
        errorTitle = "No Text Found";
        errorMessage = "Could not extract text from this file. Please try a different format or check the file content.";
      } else if (error.message.includes('AI response')) {
        errorTitle = "AI Processing Error";
        errorMessage = "The AI service encountered an issue. Please try again in a moment.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Your CV
        </CardTitle>
        <CardDescription>
          Upload your existing CV to automatically extract and populate your profile information. Our enhanced AI system uses advanced parsing to capture all details from your resume.
          <br />
          <span className="text-xs text-muted-foreground mt-1 block">
            Supports PDF (text-based), DOCX, and TXT files (max 10MB). For scanned PDFs, please convert to DOCX or retype as TXT.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            dragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          } ${file ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-3">
            {file ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-8 w-8" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div>
                  <Label htmlFor="cv-upload" className="cursor-pointer text-base font-medium hover:text-primary">
                    Click to upload or drag and drop
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, DOCX, or TXT files accepted
                  </p>
                </div>
              </>
            )}
          </div>
          <Input
            id="cv-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={parseCV}
            disabled={!file || parsing || isLoading}
            className="flex-1"
            size="lg"
          >
            {parsing ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span>Parsing CV with AI...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Parse CV with AI
              </>
            )}
          </Button>
          
          {file && (
            <Button
              variant="outline"
              onClick={removeFile}
              disabled={parsing || isLoading}
              size="lg"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tips:</strong> For best results, use a text-based PDF or DOCX file with clear sections. 
            Avoid scanned/image PDFs. Include sections for education, experience, skills, and projects with proper formatting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
