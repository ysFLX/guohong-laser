import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'spare-parts';

async function listAll(supabase: ReturnType<typeof createClient>, prefix = '') {
  const all: { name: string }[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;
    if (!data?.length) break;

    for (const item of data) {
      if (item.name) all.push({ name: prefix ? `${prefix}/${item.name}` : item.name });
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return all;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error('ENV eksik: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // root'taki dosyaları listele
  const items = await listAll(supabase, '');

  if (!items.length) {
    console.log('Dosya bulunamadi.');
    return;
  }

  console.log(`Toplam ${items.length} dosya bulundu. CacheControl set ediliyor...`);

  const concurrency = 5;
  let idx = 0;

  const worker = async () => {
    while (idx < items.length) {
      const current = items[idx++];
      const path = current.name;

      // klasör gelirse atla (bazı listelerde "folders" name ile döner)
      if (!path || path.endsWith('/')) continue;

      // indir
      const { data: file, error: dlErr } = await supabase.storage.from(BUCKET).download(path);
      if (dlErr) {
        console.log('Download hata:', path, dlErr.message);
        continue;
      }

      // tekrar upload (upsert) + cacheControl
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: true,
        cacheControl: '31536000', // 1 yıl
        contentType: file.type || undefined,
      });

      if (upErr) {
        console.log('Upload hata:', path, upErr.message);
        continue;
      }

      console.log('OK:', path);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log('Bitti ✅');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
