import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { backendLogger } from '@/lib/logger';

export async function GET(
  req: Request,
  { params }: { params: { lang: string } }
) {
  try {
    const lang = params.lang;
    backendLogger.debug('Loading translations', { language: lang });

    const filePath = path.join(process.cwd(), 'messages', `${lang}.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);
      
      backendLogger.info('Translations loaded successfully', {
        language: lang,
        translationKeys: Object.keys(translations)
      });
      
      return NextResponse.json(translations);
    } catch (error) {
      backendLogger.error('Translation file not found, falling back to English', {
        language: lang,
        error
      });
      
      // If requested language file doesn't exist, fall back to English
      const defaultFilePath = path.join(process.cwd(), 'messages', 'en.json');
      const defaultContent = await fs.readFile(defaultFilePath, 'utf-8');
      const defaultTranslations = JSON.parse(defaultContent);
      
      return NextResponse.json(defaultTranslations);
    }
  } catch (error) {
    backendLogger.error('Translation fetch error', error);
    return NextResponse.json(
      { message: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}