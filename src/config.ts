import { linkSeguro } from './lib/link';
// Configuração lida das variáveis de ambiente (arquivo .env). Ver .env.example.
export const config = {
  /** ID de afiliado do Booking.com. Vazio = link sem comissão. */
  bookingAid: import.meta.env.VITE_BOOKING_AID ?? '',
  /** Domínio cadastrado no Plausible (métrica de usuário ativo). Vazio = sem métrica. */
  plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? '',
  /** Link de afiliado de um comparador de seguro viagem. Vazio = o app mostra só as dicas, sem botão. */
  seguroUrl: import.meta.env.VITE_SEGURO_URL ?? '',
  /** Supabase (grupos e conta). Vazio = modo demonstração, tudo no aparelho. A chave "anon" é pública; nunca use a "service_role" aqui. */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnon: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  /** Mapa de fundo. Padrão: OpenStreetMap (uso leve). Antes do lançamento, troque por um provedor com chave (ver .env.example). */
  /** Chave da Google Maps Embed API (grátis). Vazio = incorporação clássica do Google Maps. */
  googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '',
  mapaTiles: import.meta.env.VITE_MAPA_TILES || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapaCredito: import.meta.env.VITE_MAPA_CREDITO || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
};

/** Link de reserva de hospedagem (afiliado). */
export function linkHospedagem(busca: string): string {
  const u = new URL('https://www.booking.com/searchresults.pt-br.html');
  u.searchParams.set('ss', busca);
  if (config.bookingAid) u.searchParams.set('aid', config.bookingAid);
  return u.toString();
}

/** Link para o site oficial do resort, com marcação de origem. null = link inválido ou não seguro (o app esconde o botão). */
export function linkOficial(url: string | null | undefined): string | null {
  const seguro = linkSeguro(url);
  if (!seguro) return null;
  const u = new URL(seguro);
  u.searchParams.set('utm_source', 'pico6961');
  u.searchParams.set('utm_medium', 'app');
  return u.toString();
}
