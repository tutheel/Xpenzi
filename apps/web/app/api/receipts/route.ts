import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const receipt = await prisma.receipt.create({
    data: {
      mimeType: file.type || 'application/octet-stream',
      content: buffer,
    },
  });

  return NextResponse.json({ receiptId: receipt.id });
}
