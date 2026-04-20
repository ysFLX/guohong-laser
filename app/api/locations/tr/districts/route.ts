import { getDistrictsByCityCode, isCityCode } from "turkey-neighbourhoods";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code || !isCityCode(code)) {
    return new Response(JSON.stringify({ error: "Geçersiz Ä°l kodu" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const districts = getDistrictsByCityCode(code);
  return new Response(JSON.stringify({ districts }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

