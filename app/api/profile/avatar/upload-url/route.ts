import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { AVATAR_UPLOAD_MAX_BYTES, validateImageUpload } from '@/lib/uploadValidation';

const BUCKET = 'profile-avatars';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  let body: { fileName?: string; contentType?: string; size?: number };
  try {
    body = (await request.json()) as { fileName?: string; contentType?: string; size?: number };
  } catch {
    return Response.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  let upload;
  try {
    upload = validateImageUpload(
      {
        fileName: body.fileName,
        contentType: body.contentType,
        size: body.size,
      },
      AVATAR_UPLOAD_MAX_BYTES,
    );
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Supabase ayarları eksik' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const bucketList = await supabase.storage.listBuckets();
  const exists = bucketList.data?.some((bucket) => bucket.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }

  const objectPath = `${session.user.id}/${crypto.randomUUID()}-${upload.safeName}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath, {
    upsert: true,
  });

  if (error || !data) {
    return Response.json({ error: error?.message || 'Upload url oluşturulamadı' }, { status: 500 });
  }

  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  return Response.json({
    token: data.token,
    path: data.path,
    contentType: upload.contentType,
    maxBytes: upload.maxBytes,
    publicUrl,
  });
}
