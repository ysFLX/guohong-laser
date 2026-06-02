import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { validateImageUpload } from '@/lib/uploadValidation';

const BUCKET = 'spare-parts';

type UploadRequest = {
  fileName?: string;
  contentType?: string;
  size?: number;
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase env eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.' },
      { status: 500 },
    );
  }

  let body: UploadRequest;
  try {
    body = (await req.json()) as UploadRequest;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  let upload;
  try {
    upload = validateImageUpload({
      fileName: body.fileName,
      contentType: body.contentType,
      size: body.size,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  const { id } = await ctx.params;
  const objectPath = `${id}/${crypto.randomUUID()}-${upload.safeName}`;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath, {
    upsert: true,
  });

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Signed upload oluşturulamadı' }, { status: 500 });
  }

  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    contentType: upload.contentType,
    maxBytes: upload.maxBytes,
    publicUrl,
  });
}
