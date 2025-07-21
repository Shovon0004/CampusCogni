import { GoogleGenerativeAI } from '@google/generative-ai';
import { createWorker } from 'tesseract.js';
import { getGeminiApiKey } from './config';

// Initialize Google Generative AI with environment variable
const getGeminiClient = () => {
  const apiKey = getGeminiApiKey();
  return new GoogleGenerativeAI(apiKey);
};

export interface ParsedCVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    location: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    link: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
  }>;
}

export async function parseCVWithGemini(fileContent: string, fileName: string): Promise<ParsedCVData> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
You are an AI expert specializing in CV/Resume parsing with EXTREME attention to detail. Your mission is to extract EVERY SINGLE piece of information from this resume with 100% accuracy and completeness. Missing even the smallest detail is NOT acceptable.

RESUME TEXT TO PARSE:
${fileContent}

🔍 ULTRA-DETAILED EXTRACTION REQUIREMENTS:

PERSONAL INFORMATION - Extract EVERYTHING:
- Full name (first, middle, last names)
- ALL email addresses (personal, professional, academic)
- ALL phone numbers (mobile, home, work, international format)
- Complete address (street, city, state, country, postal code)
- LinkedIn profile URLs
- GitHub profile URLs
- Personal websites, portfolios, blogs
- Professional social media profiles
- Date of birth (if mentioned)
- Nationality/citizenship (if mentioned)
- Professional summary/career objective/personal statement

EDUCATION - Extract EVERY educational detail:
- Institution names (universities, colleges, schools, online platforms)
- Degree types (Bachelor's, Master's, PhD, certificates, diplomas)
- Field of study/major/specialization
- Graduation dates (start date, end date, expected graduation)
- GPA, CGPA, percentage, grades, class rank
- Academic honors, dean's list, scholarships
- Relevant coursework, thesis topics
- Academic projects, research work
- Study abroad programs
- Online courses, MOOCs, certifications

WORK EXPERIENCE - Extract EVERY employment detail:
- Company names (full legal names and common names)
- Job titles/positions (current and previous)
- Employment dates (start month/year, end month/year)
- Employment type (full-time, part-time, internship, contract, freelance)
- Work locations (city, state, country, remote)
- Detailed job descriptions and responsibilities
- Key achievements and accomplishments
- Technologies, tools, software used
- Team size managed
- Budget/revenue figures handled
- Promotions and career progression

PROJECTS - Extract EVERY project detail:
- Project names/titles
- Detailed project descriptions
- Role in the project (individual, team member, team lead)
- Technologies used (programming languages, frameworks, tools)
- Project duration (start date, end date)
- Project links (GitHub repositories, live demos, documentation)
- Team size and collaboration details
- Project outcomes and results
- Awards or recognition received

TECHNICAL SKILLS - Extract EVERY skill mentioned:
- Programming languages (Python, JavaScript, Java, C++, etc.)
- Web technologies (HTML, CSS, React, Angular, Vue, etc.)
- Backend technologies (Node.js, Django, Flask, Spring, etc.)
- Databases (MySQL, PostgreSQL, MongoDB, Redis, etc.)
- Cloud platforms (AWS, Azure, Google Cloud, etc.)
- DevOps tools (Docker, Kubernetes, Jenkins, etc.)
- Version control (Git, SVN, etc.)
- Operating systems (Windows, Linux, macOS, etc.)
- Software and tools (Photoshop, Excel, JIRA, etc.)
- Frameworks and libraries
- Methodologies (Agile, Scrum, etc.)

CERTIFICATIONS & ACHIEVEMENTS - Extract EVERYTHING:
- Professional certifications (AWS, Google, Microsoft, etc.)
- Course completion certificates
- Industry certifications
- Awards and honors
- Competition wins and rankings
- Publications and research papers
- Patents and intellectual property
- Speaking engagements
- Volunteer work and community service
- Leadership roles and positions

LANGUAGES - Extract ALL language information:
- Native languages
- Foreign languages spoken
- Proficiency levels (beginner, intermediate, advanced, fluent, native)
- Language certifications (TOEFL, IELTS, etc.)

ADDITIONAL INFORMATION - Extract ANY other details:
- Interests and hobbies
- Sports and athletics
- Travel experiences
- Cultural activities
- References (if mentioned)
- Availability and notice period
- Salary expectations (if mentioned)
- Work authorization status
- Security clearances

🎯 CRITICAL EXTRACTION RULES:
1. Read EVERY single word in the resume
2. Extract ALL dates, numbers, percentages, and metrics
3. Preserve original wording and technical terms
4. Capture ALL contact information and URLs
5. Don't skip ANY section, no matter how small
6. Extract information from headers, footers, and margins
7. Identify and extract ALL company names, even if abbreviated
8. Capture ALL location information (cities, states, countries)
9. Extract ALL educational institutions, no matter the level
10. Find and extract ALL project links and technical details

RETURN EXACT JSON FORMAT:
{
  "personalInfo": {
    "firstName": "exact_first_name",
    "lastName": "exact_last_name",
    "email": "primary_email_address",
    "phone": "primary_phone_number",
    "location": "complete_address_or_location",
    "summary": "complete_professional_summary_or_objective"
  },
  "education": [
    {
      "id": "edu-1",
      "institution": "complete_institution_name",
      "degree": "exact_degree_type",
      "fieldOfStudy": "exact_field_of_study",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "grade": "exact_grade_or_gpa"
    }
  ],
  "experience": [
    {
      "id": "exp-1",
      "company": "complete_company_name",
      "position": "exact_job_title",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": "complete_detailed_job_description_and_achievements",
      "location": "complete_work_location"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "title": "exact_project_name",
      "description": "complete_detailed_project_description_and_outcomes",
      "technologies": ["exact_tech1", "exact_tech2", "exact_tech3"],
      "link": "exact_project_url_or_github_link",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ],
  "skills": ["exact_skill1", "exact_skill2", "exact_technology1", "exact_framework1"],
  "languages": [
    {
      "language": "exact_language_name",
      "proficiency": "exact_proficiency_level"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "complete_certification_name",
      "issuer": "exact_issuing_organization",
      "date": "YYYY-MM-DD",
      "credentialId": "exact_credential_id_if_available"
    }
  ]
}

⚠️ ABSOLUTELY CRITICAL:
- Extract EVERY detail mentioned in the resume
- For missing information, use empty strings "", NEVER null
- For missing arrays, use empty arrays []
- Generate unique IDs for each entry
- Return ONLY valid JSON without markdown
- Be EXTREMELY thorough - this affects someone's career opportunities

START COMPREHENSIVE PARSING NOW:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response to extract only JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure all required fields exist
    const validatedData = {
      personalInfo: {
        firstName: parsedData.personalInfo?.firstName || "",
        lastName: parsedData.personalInfo?.lastName || "",
        email: parsedData.personalInfo?.email || "",
        phone: parsedData.personalInfo?.phone || "",
        location: parsedData.personalInfo?.location || "",
        summary: parsedData.personalInfo?.summary || ""
      },
      education: (parsedData.education || []).map((item: any, index: number) => ({
        id: item.id || `edu-${index + 1}-${Date.now()}`,
        institution: item.institution || "",
        degree: item.degree || "",
        fieldOfStudy: item.fieldOfStudy || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        grade: item.grade || ""
      })),
      experience: (parsedData.experience || []).map((item: any, index: number) => ({
        id: item.id || `exp-${index + 1}-${Date.now()}`,
        company: item.company || "",
        position: item.position || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        description: item.description || "",
        location: item.location || ""
      })),
      projects: (parsedData.projects || []).map((item: any, index: number) => ({
        id: item.id || `proj-${index + 1}-${Date.now()}`,
        title: item.title || "",
        description: item.description || "",
        technologies: Array.isArray(item.technologies) ? item.technologies : [],
        link: item.link || "",
        startDate: item.startDate || "",
        endDate: item.endDate || ""
      })),
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      languages: (parsedData.languages || []).map((item: any) => ({
        language: item.language || item,
        proficiency: item.proficiency || "Proficient"
      })),
      certifications: (parsedData.certifications || []).map((item: any, index: number) => ({
        id: item.id || `cert-${index + 1}-${Date.now()}`,
        name: item.name || "",
        issuer: item.issuer || "",
        date: item.date || "",
        credentialId: item.credentialId || ""
      }))
    };

    return validatedData;
  } catch (error) {
    console.error('Error parsing CV with Gemini:', error);
    throw new Error(`Failed to parse CV content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDocx(file);
  } else if (fileType === 'text/plain') {
    return await file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // First try the simple text extraction method
    const simpleText = await extractTextFromPDFSimple(file);
    if (simpleText && simpleText.trim().length > 100) {
      console.log('Simple PDF extraction successful, length:', simpleText.length);
      return simpleText;
    }
  } catch (error) {
    console.log('Simple PDF extraction failed, trying OCR...', error);
  }

  try {
    // If simple extraction fails, use OCR with Tesseract.js
    console.log('Starting OCR extraction for PDF...');
    return await extractTextFromPDFWithOCR(file);
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from PDF. Please try uploading a DOCX or TXT file for better results, or ensure your PDF contains selectable text.');
  }
}

// New OCR-based PDF text extraction using Tesseract.js
async function extractTextFromPDFWithOCR(file: File): Promise<string> {
  try {
    // Convert PDF to images and extract text using OCR
    const worker = await createWorker('eng');
    
    console.log('Tesseract worker created, starting PDF to image conversion...');
    
    // For browser compatibility, we'll read the PDF as an image directly
    // Create a canvas to render the PDF content
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    // Read file as data URL for image processing
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // For PDFs that can be processed as images, use OCR directly
    console.log('Running OCR on PDF content...');
    const { data: { text } } = await worker.recognize(dataUrl);

    await worker.terminate();

    if (!text || text.trim().length < 50) {
      throw new Error('OCR could not extract sufficient text from PDF. The file may be damaged or contain only images.');
    }

    // Clean the OCR text
    const cleanedText = text
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    console.log('OCR extraction successful, text length:', cleanedText.length);
    console.log('OCR text preview:', cleanedText.substring(0, 300));

    return cleanedText;
  } catch (error) {
    console.error('OCR PDF extraction error:', error);
    throw new Error('Failed to extract text using OCR. Please ensure the PDF contains readable text or try converting to DOCX format.');
  }
}

// Enhanced PDF text extraction using multiple methods for maximum text capture across all fonts and formats
async function extractTextFromPDFSimple(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to string for text extraction
  const decoder = new TextDecoder('latin1');
  const pdfContent = decoder.decode(uint8Array);
  
  let extractedText = '';
  const textParts: string[] = [];
  const uniqueTexts = new Set<string>(); // Prevent duplicates
  
  console.log('Starting comprehensive PDF text extraction for all fonts and formats...');
  
  // Method 1: Extract text from parentheses (most common in PDFs) - Enhanced for all fonts
  const parenthesesRegex = /\(([^)]*)\)/g;
  let parenthesesMatch;
  while ((parenthesesMatch = parenthesesRegex.exec(pdfContent)) !== null) {
    let text = parenthesesMatch[1];
    if (text && text.length > 0) {
      // Handle escape sequences
      text = text.replace(/\\n/g, '\n')
                .replace(/\\r/g, '\n')
                .replace(/\\t/g, ' ')
                .replace(/\\\\/g, '\\')
                .replace(/\\'/g, "'")
                .replace(/\\"/g, '"');
      
      // Check if it's meaningful text (letters, numbers, or common symbols)
      if (/[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
        textParts.push(text);
        uniqueTexts.add(text.trim());
      }
    }
  }
  console.log('Method 1 (parentheses) extracted:', textParts.length, 'unique text parts');
  
  // Method 2: Extract from BT/ET text objects (Enhanced for different font encodings)
  const textObjectRegex = /BT\s+([\s\S]*?)\s+ET/g;
  let textObjectMatch;
  while ((textObjectMatch = textObjectRegex.exec(pdfContent)) !== null) {
    const textObject = textObjectMatch[1];
    
    // Extract from Tj (show text) commands
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(textObject)) !== null) {
      let text = tjMatch[1];
      if (text && text.length > 0) {
        text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\\t/g, ' ');
        if (/[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
          textParts.push(text);
          uniqueTexts.add(text.trim());
        }
      }
    }
    
    // Extract from TJ (show text with positioning) commands - handles spaced text
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(textObject)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let stringMatch;
      const spacedTextParts = [];
      while ((stringMatch = stringRegex.exec(arrayContent)) !== null) {
        let text = stringMatch[1];
        if (text && text.length > 0) {
          text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\\t/g, ' ');
          spacedTextParts.push(text);
        }
      }
      if (spacedTextParts.length > 0) {
        const combinedText = spacedTextParts.join('');
        if (/[a-zA-Z0-9@._-]/.test(combinedText) && !uniqueTexts.has(combinedText.trim())) {
          textParts.push(combinedText);
          uniqueTexts.add(combinedText.trim());
        }
      }
    }
    
    // Extract from "..." quoted strings in text objects
    const quotedInObjectRegex = /"([^"]*)"/g;
    let quotedInObjectMatch;
    while ((quotedInObjectMatch = quotedInObjectRegex.exec(textObject)) !== null) {
      let text = quotedInObjectMatch[1];
      if (text && text.length > 0 && /[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
        textParts.push(text);
        uniqueTexts.add(text.trim());
      }
    }
  }
  
  console.log('Method 2 (BT/ET objects) total extracted parts:', textParts.length);
  
  // Method 3: Extract from stream content (Enhanced for compressed and encoded content)
  const streamRegex = /stream\s+([\s\S]*?)\s+endstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(pdfContent)) !== null) {
    const streamContent = streamMatch[1];
    
    // Look for text patterns in streams
    const streamTextRegex = /\(([^)]*)\)/g;
    let streamTextMatch;
    while ((streamTextMatch = streamTextRegex.exec(streamContent)) !== null) {
      let text = streamTextMatch[1];
      if (text && text.length > 0) {
        text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\\t/g, ' ');
        if (/[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
          textParts.push(text);
          uniqueTexts.add(text.trim());
        }
      }
    }
    
    // Look for unencoded readable text in streams
    const readableInStreamRegex = /[A-Za-z0-9][A-Za-z0-9\s@._-]{3,}/g;
    let readableInStreamMatch;
    while ((readableInStreamMatch = readableInStreamRegex.exec(streamContent)) !== null) {
      const text = readableInStreamMatch[0].trim();
      if (text.length > 3 && !text.includes('/') && !text.includes('<<') && !uniqueTexts.has(text)) {
        textParts.push(text);
        uniqueTexts.add(text);
      }
    }
  }
  
  // Method 4: Extract text with positioning commands (Handles different font positioning)
  const positioningRegex = /(?:[-\d.]+\s+[-\d.]+\s+(?:Td|TD|Tm)|\s+Tm)\s*\(([^)]*)\)/g;
  let positioningMatch;
  while ((positioningMatch = positioningRegex.exec(pdfContent)) !== null) {
    let text = positioningMatch[1];
    if (text && text.length > 0) {
      text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\\t/g, ' ');
      if (/[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
        textParts.push(text);
        uniqueTexts.add(text.trim());
      }
    }
  }
  
  // Method 5: Extract text from hex strings (Enhanced for different encodings)
  const hexStringRegex = /<([0-9A-Fa-f]+)>/g;
  let hexMatch;
  while ((hexMatch = hexStringRegex.exec(pdfContent)) !== null) {
    try {
      const hexString = hexMatch[1];
      if (hexString.length % 2 === 0 && hexString.length > 2) {
        let text = '';
        
        // Try UTF-8 decoding first
        try {
          const bytes = [];
          for (let i = 0; i < hexString.length; i += 2) {
            bytes.push(parseInt(hexString.substr(i, 2), 16));
          }
          text = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
        } catch {
          // Fallback to ASCII
          for (let i = 0; i < hexString.length; i += 2) {
            const charCode = parseInt(hexString.substr(i, 2), 16);
            if (charCode >= 32 && charCode <= 126) { // Printable ASCII
              text += String.fromCharCode(charCode);
            } else if (charCode >= 160 && charCode <= 255) { // Extended ASCII
              text += String.fromCharCode(charCode);
            }
          }
        }
        
        if (text.length > 0 && /[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
          textParts.push(text);
          uniqueTexts.add(text.trim());
        }
      }
    } catch (error) {
      // Ignore invalid hex strings
    }
  }
  
  // Method 6: Extract any quoted strings (Enhanced)
  const quotedStringRegex = /"([^"]*)"/g;
  let quotedMatch;
  while ((quotedMatch = quotedStringRegex.exec(pdfContent)) !== null) {
    let text = quotedMatch[1];
    if (text && text.length > 0 && /[a-zA-Z0-9@._-]/.test(text) && !text.includes('/') && !uniqueTexts.has(text.trim())) {
      textParts.push(text);
      uniqueTexts.add(text.trim());
    }
  }
  
  // Method 7: Extract font-specific content (FontFile, FontDescriptor analysis)
  const fontContentRegex = /\/Contents\s*\[([\s\S]*?)\]/g;
  let fontContentMatch;
  while ((fontContentMatch = fontContentRegex.exec(pdfContent)) !== null) {
    const content = fontContentMatch[1];
    const textInContentRegex = /\(([^)]*)\)/g;
    let textInContentMatch;
    while ((textInContentMatch = textInContentRegex.exec(content)) !== null) {
      let text = textInContentMatch[1];
      if (text && text.length > 0 && /[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
        textParts.push(text);
        uniqueTexts.add(text.trim());
      }
    }
  }
  
  // Method 8: Extract from unicode strings (Enhanced for international characters)
  const unicodeRegex = /\\u([0-9A-Fa-f]{4})/g;
  let unicodeMatch;
  while ((unicodeMatch = unicodeRegex.exec(pdfContent)) !== null) {
    try {
      const unicodeChar = String.fromCharCode(parseInt(unicodeMatch[1], 16));
      if (/[a-zA-Z0-9@._-]/.test(unicodeChar)) {
        textParts.push(unicodeChar);
      }
    } catch (error) {
      // Ignore invalid unicode
    }
  }
  
  // Method 9: Look for unescaped readable text patterns (Enhanced regex)
  const unescapedTextRegex = /(?:^|\s)([A-Za-z][A-Za-z0-9\s@._-]{2,})(?=\s|$)/g;
  let unescapedMatch;
  while ((unescapedMatch = unescapedTextRegex.exec(pdfContent)) !== null) {
    const text = unescapedMatch[1].trim();
    if (text.length > 2 && !text.includes('/') && !text.includes('<<') && !text.includes('>>') && !uniqueTexts.has(text)) {
      textParts.push(text);
      uniqueTexts.add(text);
    }
  }
  
  // Method 10: Extract from XObject references and Form content
  const xobjectRegex = /\/XObject\s*<<([\s\S]*?)>>/g;
  let xobjectMatch;
  while ((xobjectMatch = xobjectRegex.exec(pdfContent)) !== null) {
    const xobjectContent = xobjectMatch[1];
    const textInXObjectRegex = /\(([^)]*)\)/g;
    let textInXObjectMatch;
    while ((textInXObjectMatch = textInXObjectRegex.exec(xobjectContent)) !== null) {
      let text = textInXObjectMatch[1];
      if (text && text.length > 0 && /[a-zA-Z0-9@._-]/.test(text) && !uniqueTexts.has(text.trim())) {
        textParts.push(text);
        uniqueTexts.add(text.trim());
      }
    }
  }
  
  // Combine all extracted text parts
  extractedText = textParts.join(' ');
  
  if (!extractedText || extractedText.trim().length < 50) {
    // Final fallback: aggressive text extraction
    console.log('Primary extraction insufficient, trying aggressive fallback...');
    
    const aggressiveRegex = /[A-Za-z0-9@._-]+/g;
    const aggressiveMatches = pdfContent.match(aggressiveRegex);
    if (aggressiveMatches) {
      extractedText = aggressiveMatches
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .filter(text => !text.match(/^[0-9.]+$/)) // Remove pure numbers
        .join(' ');
    }
    
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Could not extract sufficient text. This PDF may be image-based, heavily encrypted, or use unsupported font encoding. For best results, please convert to DOCX format or ensure the PDF has selectable text.');
    }
  }
  
  // Enhanced text cleaning and normalization
  extractedText = extractedText
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/[^\x20-\x7E\n\u00A0-\u024F\u1E00-\u1EFF]/g, ' ') // Keep Latin characters and diacritics
    .trim();
  
  console.log('Enhanced PDF text extraction completed successfully!');
  console.log('Final extracted text length:', extractedText.length);
  console.log('Unique text parts found:', uniqueTexts.size);
  console.log('Text preview:', extractedText.substring(0, 500));
  
  return extractedText;
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    
    // Extract both raw text and HTML for maximum content capture across all font types
    const [rawResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ arrayBuffer }),
      mammoth.convertToHtml({ arrayBuffer })
    ]);
    
    let extractedText = '';
    
    console.log('DOCX extraction started with enhanced font support...');
    
    // Try raw text extraction first (best for structure preservation)
    if (rawResult.value && rawResult.value.trim().length > 50) {
      extractedText = rawResult.value;
      console.log('DOCX raw text extraction successful, length:', extractedText.length);
    }
    
    // If raw text is insufficient, try HTML extraction and strip tags
    if (extractedText.length < 100 && htmlResult.value) {
      console.log('Raw text insufficient, trying HTML extraction...');
      
      // Create a more robust HTML parser
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlResult.value;
      
      // Extract text while preserving structure
      const htmlText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (htmlText.length > extractedText.length) {
        extractedText = htmlText;
        console.log('DOCX HTML extraction provided more content, length:', extractedText.length);
      }
    }
    
    // Additional fallback: Try to extract from binary content if mammoth fails
    if (extractedText.length < 50) {
      console.log('Standard extraction insufficient, trying binary fallback...');
      
      // Convert to text and look for readable content
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const binaryText = decoder.decode(new Uint8Array(arrayBuffer));
      
      // Extract readable text patterns from binary
      const readablePatterns = binaryText.match(/[A-Za-z0-9\s@._-]{4,}/g);
      if (readablePatterns) {
        const fallbackText = readablePatterns
          .filter(text => text.length > 3 && /[a-zA-Z]/.test(text))
          .filter(text => !text.includes('Content-Type') && !text.includes('xml'))
          .join(' ');
        
        if (fallbackText.length > extractedText.length) {
          extractedText = fallbackText;
          console.log('Binary fallback extraction successful, length:', extractedText.length);
        }
      }
    }
    
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Could not extract readable text from DOCX. The file may be corrupted, password-protected, or contain only images.');
    }
    
    // Enhanced text cleaning while preserving structure and international characters
    let cleanedText = extractedText;
    
    // Preserve line breaks for section separation
    cleanedText = cleanedText.replace(/\r\n/g, '\n');
    cleanedText = cleanedText.replace(/\r/g, '\n');
    
    // Clean up excessive whitespace but preserve paragraph structure
    cleanedText = cleanedText.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
    cleanedText = cleanedText.replace(/\n[ \t]+/g, '\n'); // Remove spaces after line breaks
    cleanedText = cleanedText.replace(/[ \t]+\n/g, '\n'); // Remove spaces before line breaks
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive line breaks
    
    // Remove document artifacts but preserve content
    cleanedText = cleanedText.replace(/^[\s\n]+/, ''); // Remove leading whitespace
    cleanedText = cleanedText.replace(/[\s\n]+$/, ''); // Remove trailing whitespace
    
    // Remove common DOCX artifacts while preserving international characters
    cleanedText = cleanedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
    
    console.log('DOCX text extraction and cleaning completed with enhanced font support');
    console.log('Final text length:', cleanedText.length);
    console.log('Text preview:', cleanedText.substring(0, 500));
    
    return cleanedText;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to extract text from DOCX. Please ensure the file is not corrupted, password-protected, or try converting to PDF format.');
  }
}
