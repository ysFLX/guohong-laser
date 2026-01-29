import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const BUCKET = 'spare-parts';

type SparePartImageCreateResult = {
  id: string;
  url: string;
  sparePartId: string;
};

type SparePartFindResult = {
  id: string;
  imageUrl: string | null;
};

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<SparePartFindResult | null>;
    update: (args: unknown) => Promise<SparePartFindResult>;
  };
  sparePartImage: {
    create: (args: unknown) => Promise<SparePartImageCreateResult>;
  };
};

function safeFileExt(file: File) {
  const t = (file.type || '').toLowerCase();
  if (t === 'image/png') return 'png';
  if (t === 'image/webp') return 'webp';
  if (t === 'image/jpeg') return 'jpg';
  return 'bin';
}

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

  const { id } = await ctx.params;

  const form = await req.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file alanı gerekli' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Sadece resim dosyası yüklenebilir' }, { status: 400 });
  }

  const ext = safeFileExt(file);
  const objectPath = `${id}/${Date.now()}.${ext}`;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '31536000',
  });

  if (uploadError) {
    return NextResponse.json({ error: `Upload başarısız: ${uploadError.message}` }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;

  const created = await prismaSpareParts.sparePartImage.create({
    data: {
      sparePartId: id,
      url: publicUrl,
    },
    select: { id: true, url: true, sparePartId: true },
  });

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    select: { id: true, imageUrl: true },
  });

  if (part && !part.imageUrl) {
    await prismaSpareParts.sparePart.update({
      where: { id },
      data: { imageUrl: publicUrl },
      select: { id: true, imageUrl: true },
    });
  }

  return NextResponse.json({ item: created });
}
