import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { validateReturnEvidenceUpload } from '@/lib/uploadValidation';

const BUCKET = 'returns';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Dosya yuklemek icin giris yapmalisiniz.' }, { status: 401 });
    }

    const body = (await req.json()) as { filename?: string; fileName?: string; contentType?: string; size?: number };
    const filename = typeof body.filename === 'string' ? body.filename.trim() : '';
    const contentType = typeof body.contentType === 'string' ? body.contentType.trim() : '';

    if (!filename && !body.fileName) {
      return NextResponse.json({ error: 'filename gerekli' }, { status: 400 });
    }

    let upload;
    try {
      upload = validateReturnEvidenceUpload({
        fileName: body.fileName ?? filename,
        contentType,
        size: body.size,
      });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase ayarları eksik' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const bucketList = await supabase.storage.listBuckets();
    if (!bucketList.data?.some((bucket) => bucket.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: true });
    }

    const key = `returns/${crypto.randomUUID()}-${upload.safeName}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(key, {
      upsert: true,
    });

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Signed upload oluşturulamadı' }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${key}`;
    return NextResponse.json({
      uploadUrl: data.signedUrl,
      path: key,
      contentType: upload.contentType,
      maxBytes: upload.maxBytes,
      publicUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Upload url hatası' }, { status: 500 });
  }
}
