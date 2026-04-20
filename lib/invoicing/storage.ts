import { createClient } from '@supabase/supabase-js';

const BUCKET = 'invoices';

let bucketEnsured = false;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase env eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.');
  }

  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function ensureBucket() {
  if (bucketEnsured) return;

  const supabase = getSupabaseAdmin();
  const bucketList = await supabase.storage.listBuckets();
  const exists = bucketList.data?.some((bucket) => bucket.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }

  bucketEnsured = true;
}

export async function uploadInvoiceObject(params: {
  objectPath: string;
  contentType: string;
  data: Buffer;
}) {
  await ensureBucket();
  const supabase = getSupabaseAdmin();

  const bytes = Uint8Array.from(params.data);
  const { error } = await supabase.storage.from(BUCKET).upload(params.objectPath, bytes, {
    contentType: params.contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message || 'Fatura dosyası yüklenemedi');
  }

  return params.objectPath;
}

export async function getSignedInvoiceUrl(objectPath: string, expiresInSeconds = 60) {
  await ensureBucket();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(objectPath, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Fatura linki oluşturulamadı');
  }
  return data.signedUrl;
}

