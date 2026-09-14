import { GoogleGenerativeAI } from '@google/generative-ai';
import { BadRequestError } from '../errors';
import pdfParse from 'pdf-parse';

export class AIService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateQuizFromPDF(pdfBuffer: Buffer, mimeType: string = 'application/pdf'): Promise<any[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new BadRequestError('GEMINI_API_KEY is not configured on the server.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    let pdfText = '';
    try {
      const data = await pdfParse(pdfBuffer);
      pdfText = data.text;
    } catch (parseError) {
      console.error('Failed to parse PDF:', parseError);
      throw new BadRequestError('Could not read the text from the uploaded PDF. Please ensure it is a valid PDF document.');
    }

    const prompt = `
You are an expert teacher. I have provided the text from a document (lecture notes, chapter, etc) below.
Please analyze the document and generate 10 multiple-choice questions based on the content.
And make sure your content output should look like as it is made by a human teacaher and not by any ai. 
and the dificulty of the questions would be in the 30% easy 50% medium level and 20% hard level. 
Return the output STRICTLY as a JSON array of objects. Do not include markdown formatting or backticks around the JSON.
Each object must have the following structure:
{
  "text": "The question text here",
  "points": 10,
  "options": [
    { "text": "Option 1", "isCorrect": true },
    { "text": "Option 2", "isCorrect": false },
    { "text": "Option 3", "isCorrect": false },
    { "text": "Option 4", "isCorrect": false }
  ]
}

DOCUMENT TEXT:
${pdfText}
`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError.message);
      throw new BadRequestError(`Gemini API failed: ${apiError.message}. Please check your GEMINI_API_KEY and ensure it has sufficient quota.`);
    }

    const responseText = result.response.text();
    // Sometimes the model wraps the output in ```json ... ```
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        throw new BadRequestError('AI response is not an array.');
      }
      return parsed;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      console.error('Failed to parse AI JSON:', responseText);
      throw new BadRequestError('Failed to generate valid quiz data from AI.');
    }
  }
}
