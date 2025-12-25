import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";

import { authOptions } from "@/auth";

const BUCKET = "profile-avatars";

function getExtension(fileName?: string, contentType?: string) {
  if (fileName && fileName.includes(".")) {
    return fileName.split(".").pop() || "jpg";
  }
  if (contentType && contentType.includes("/")) {
    return contentType.split("/").pop() || "jpg";
  }
  return "jpg";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const extension = getExtension(body?.fileName, body?.contentType);
  const objectPath = `${session.user.id}/${Date.now()}.${extension}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase ayarlari eksik" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const bucketList = await supabase.storage.listBuckets();
  const exists = bucketList.data?.some((bucket) => bucket.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath, {
    upsert: true,
  });

  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message || "Upload url olusturulamadi" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const publicUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  return new Response(
    JSON.stringify({
      token: data.token,
      path: data.path,
      publicUrl,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
