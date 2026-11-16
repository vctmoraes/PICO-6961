// Links de fora do app: só http e https. Qualquer outro esquema (ex.: "javascript:") vira null, e o app esconde o botão.

/** Domínio solto, sem esquema (ex.: "resort.com" ou "www.resort.com/neve"). */
const DOMINIO = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:[/?#][^\s]*)?$/i;

/** Devolve o link pronto e seguro, ou null quando o texto não é um link http/https válido. */
export function linkSeguro(bruto: string | null | undefined): string | null {
  const t = (bruto ?? '').trim();
  if (!t) return null;
  const candidato = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : DOMINIO.test(t) ? `https://${t}` : null;
  if (!candidato) return null;
  try {
    const u = new URL(candidato);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}
