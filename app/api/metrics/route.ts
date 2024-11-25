import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { metrics } from '@/lib/metrics';
import { authOptions } from '../auth/auth-options';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const type = searchParams.get('type') || 'api';
    const period = parseInt(searchParams.get('period') || '86400000', 10); // Default 24 hours

    const metricsData = metrics.getMetrics(type, period);

    return NextResponse.json({
      metrics: metricsData,
      period,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}