import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';
import languages from '@/messages/languages.json';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      backendLogger.error('Unauthorized language update attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await req.json();
    backendLogger.debug('Language update request', { 
      userId: session.user.id,
      language 
    });

    // Validate language code
    if (!languages.supported.find(lang => lang.code === language)) {
      backendLogger.error('Invalid language code', { language });
      return NextResponse.json(
        { message: 'Invalid language code' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { language },
    });

    backendLogger.info('Language updated successfully', {
      userId: session.user.id,
      language
    });

    return NextResponse.json({ 
      message: 'Language updated successfully',
      language 
    });
  } catch (error) {
    backendLogger.error('Language update error', error);
    return NextResponse.json(
      { message: 'Failed to update language' },
      { status: 500 }
    );
  }
}