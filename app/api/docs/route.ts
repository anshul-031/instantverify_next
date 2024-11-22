import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../../../swagger.config';
import { authOptions } from '../auth/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return new NextResponse(
    swaggerUi.generateHTML(swaggerSpec, { customSiteTitle: 'InstantVerify.in API Docs' }),
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}