import { NextRequest, NextResponse } from 'next/server';
import { UniversalSyncManager } from '@/lib/data-platform/ingestion/sync-manager';
import { IngestionRepository } from '@/lib/data-platform/ingestion/repository';

export async function POST(req: NextRequest) {
  try {
    const { userId, providerId } = await req.json();

    if (!userId || !providerId) {
      return NextResponse.json(
        { error: 'Fields [userId, providerId] are required to start synchronization.' },
        { status: 400 }
      );
    }

    const job = await UniversalSyncManager.startSyncJob(userId, providerId, 'user');

    return NextResponse.json({
      success: true,
      job
    });
  } catch (e: any) {
    console.error('Start Sync Job API Error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to start ingestion pipeline.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, jobId } = await req.json();

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'Fields [userId, jobId] are required to request cancellation.' },
        { status: 400 }
      );
    }

    const job = await IngestionRepository.getSyncJob(userId, jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Sync job record not found.' },
        { status: 404 }
      );
    }

    if (job.status !== 'running' && job.status !== 'queued' && job.status !== 'waiting') {
      return NextResponse.json({
        success: false,
        message: 'Job is not in an active state and cannot be cancelled.',
        job
      });
    }

    // Update state to request cancellation
    const updatedJob = {
      ...job,
      cancellationState: 'requested' as const,
      completedAt: new Date().toISOString()
    };

    await IngestionRepository.saveSyncJob(updatedJob);

    return NextResponse.json({
      success: true,
      message: 'Cancellation request received. Halting pipeline execution.',
      job: updatedJob
    });
  } catch (e: any) {
    console.error('Cancel Sync Job API Error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to request cancellation.' },
      { status: 500 }
    );
  }
}
