import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { authOptions } from '../../auth/auth-options';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const env = process.env.NODE_ENV || 'development';
    const flagsPath = join(
      process.cwd(),
      `config/feature-flags.${env}.json`
    );

    const flags = await readFile(flagsPath, 'utf-8');
    return NextResponse.json(JSON.parse(flags));
  } catch (error) {
    console.error('Feature flags fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const flags = await req.json();
    const env = process.env.NODE_ENV || 'development';
    const flagsPath = join(
      process.cwd(),
      `config/feature-flags.${env}.json`
    );

    await writeFile(flagsPath, JSON.stringify(flags, null, 2));

    return NextResponse.json({
      message: 'Feature flags updated successfully',
    });
  } catch (error) {
    console.error('Feature flags update error:', error);
    return NextResponse.json(
      { message: 'Failed to update feature flags' },
      { status: 500 }
    );
  }
}