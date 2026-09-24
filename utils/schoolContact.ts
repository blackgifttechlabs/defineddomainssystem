export type Coordinates = { latitude: number; longitude: number };
export function parseCoordinates(latitude?: string, longitude?: string): Coordinates | null {
  if (!latitude?.trim() || !longitude?.trim()) return null;
  const lat = Number(latitude), lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? { latitude: lat, longitude: lng } : null;
}
const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
export const schoolContact = {
  name: 'Defined Domains Inclusive School',
  address: '24 Eliot Street, Rhodene, Masvingo, Zimbabwe',
  phone: env.VITE_SCHOOL_PHONE || '+263 775 926 454',
  email: env.VITE_SCHOOL_EMAIL || 'admin@defineddomain.com',
  coordinates: parseCoordinates(env.VITE_SCHOOL_LATITUDE, env.VITE_SCHOOL_LONGITUDE),
};
export function directionsUrl(destination: Coordinates | string): string {
  const params = new URLSearchParams({ api: '1', travelmode: 'driving', destination: typeof destination === 'string'
    ? destination : `${destination.latitude},${destination.longitude}` });
  return `https://www.google.com/maps/dir/?${params}`;
}
export function phoneHref(phone: string): string { return `tel:${phone.replace(/[^\d+]/g, '')}`; }
