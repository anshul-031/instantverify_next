import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: { lang: string } }
) {
  try {
    const lang = params.lang;
    const filePath = path.join(process.cwd(), 'messages', `${lang}.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);
      return NextResponse.json(translations);
    } catch (error) {
      // If requested language file doesn't exist, fall back to English
      const defaultFilePath = path.join(process.cwd(), 'messages', 'en.json');
      const defaultContent = await fs.readFile(defaultFilePath, 'utf-8');
      const defaultTranslations = JSON.parse(defaultContent);
      return NextResponse.json(defaultTranslations);
    }
  } catch (error) {
    console.error('Translation fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}