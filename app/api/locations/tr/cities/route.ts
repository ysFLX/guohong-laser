import { getCities } from "turkey-neighbourhoods";

export async function GET() {
  const cities = getCities();
  return new Response(JSON.stringify({ cities }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
