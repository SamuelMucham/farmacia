import { STORE_CEP, STORE_CITY, STORE_NUMBER, STORE_STREET } from "./data";

type Coords = { lat: number; lng: number };

export type DeliveryQuote = {
  km: number;
  estimated: boolean; // true quando usamos a distância em linha reta (rota indisponível)
};

function haversineKm(a: Coords, b: Coords) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// Converte o endereço em coordenadas (OpenStreetMap / Nominatim)
async function geocode(query: string): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(
    query
  )}`;
  const data = await fetchJson<{ lat: string; lon: string }[]>(url);
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// Distância por rotas de carro (OSRM)
async function drivingKm(from: Coords, to: Coords): Promise<number> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
  const data = await fetchJson<{ routes?: { distance: number }[] }>(url);
  const meters = data.routes?.[0]?.distance;
  if (typeof meters !== "number") throw new Error("Sem rota");
  return meters / 1000;
}

// Localiza a farmácia pelo endereço (guarda o resultado para não repetir a busca)
let storeCache: Coords | null = null;

async function getStoreCoords(): Promise<Coords> {
  if (storeCache) return storeCache;
  const tries = [
    `${STORE_STREET}, ${STORE_NUMBER}, ${STORE_CITY}, Brasil`,
    `${STORE_STREET}, ${STORE_CITY}, Brasil`,
    `${STORE_CEP}, Brasil`,
  ];
  for (const q of tries) {
    const found = await geocode(q);
    if (found) {
      storeCache = found;
      return found;
    }
  }
  throw new Error("Não foi possível localizar a loja.");
}

export async function quoteDelivery(
  street: string,
  number: string,
  city: string
): Promise<DeliveryQuote> {
  const store = await getStoreCoords();

  // tenta com número; se não achar, tenta só a rua
  let dest = await geocode(`${street}, ${number}, ${city}, Brasil`);
  if (!dest) dest = await geocode(`${street}, ${city}, Brasil`);
  if (!dest) {
    throw new Error(
      "Não encontramos esse endereço. Confira a rua e o número."
    );
  }

  let km: number;
  let estimated = false;
  try {
    km = await drivingKm(store, dest);
  } catch {
    // se o serviço de rotas falhar, usa a linha reta com margem de 30%
    km = haversineKm(store, dest) * 1.3;
    estimated = true;
  }

  return { km: Math.round(km * 10) / 10, estimated };
}
