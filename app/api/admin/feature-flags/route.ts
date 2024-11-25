import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    backendLogger.info('Feature flags fetch request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      backendLogger.warn('Unauthorized feature flags access attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const env = process.env.NODE_ENV || 'development';
    const flagsPath = join(
      process.cwd(),
      `config/feature-flags.${env}.json`
    );

    backendLogger.debug('Reading feature flags file', { env, flagsPath });
    const flags = await readFile(flagsPath, 'utf-8');

    backendLogger.info('Feature flags fetched successfully');
    return NextResponse.json(JSON.parse(flags));
  } catch (error) {
    backendLogger.error('Failed to fetch feature flags', { error });
    return NextResponse.json(
      { message: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    backendLogger.info('Feature flags update request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      backendLogger.warn('Unauthorized feature flags update attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const flags = await req.json();
    const env = process.env.NODE_ENV || 'development';
    const flagsPath = join(
      process.cwd(),
      `config/feature-flags.${env}.json`
    );

    backendLogger.debug('Updating feature flags', { env, flagsPath });
    await writeFile(flagsPath, JSON.stringify(flags, null, 2));

    backendLogger.info('Feature flags updated successfully');
    return NextResponse.json({
      message: 'Feature flags updated successfully',
    });
  } catch (error) {
    backendLogger.error('Feature flags update failed', { error });
    return NextResponse.json(
      { message: 'Failed to update feature flags' },
      { status: 500 }
    );
  }
}