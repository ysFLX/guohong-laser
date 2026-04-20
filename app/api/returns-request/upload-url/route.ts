import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';

const BUCKET = 'returns';

const getExtension = (name: string, contentType: string) => {
  const fromName = name.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName;
  const fromType = contentType.split('/').pop();
  return fromType || 'bin';
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Dosya yuklemek icin giris yapmalisiniz.' }, { status: 401 });
    }

    const body = (await req.json()) as { filename?: string; contentType?: string };
    const filename = typeof body.filename === 'string' ? body.filename.trim() : '';
    const contentType = typeof body.contentType === 'string' ? body.contentType.trim() : '';

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename ve contentType gerekli' }, { status: 400 });
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

    const ext = getExtension(filename, contentType);
    const key = `returns/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
      publicUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Upload url hatası' }, { status: 500 });
  }
}

