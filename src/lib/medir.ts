// Medição de uso (Plausible): conta ações, sem cookie e sem dado pessoal.
// Regra: nunca mande e-mail, nome, texto de mensagem ou outro dado pessoal nas propriedades.
// Lista de eventos e como criar as metas no Plausible: docs/medicao.md

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: ((evento: string, opcoes?: { props?: Props }) => void) & { q?: unknown[] };
  }
}

export type Evento =
  | 'Destino aberto'
  | 'Perfil concluído'
  | 'Roteiro criado'
  | 'Link de afiliado'
  | 'Compartilhar'
  | 'Grupo criado'
  | 'Entrou em grupo'
  | 'Mensagem enviada'
  | 'Monte minha viagem'
  | 'Lista de espera'
  | 'Aviso tocado';

export function medir(evento: Evento, props?: Props): void {
  try {
    window.plausible?.(evento, props ? { props } : undefined);
  } catch {
    /* a medição nunca pode quebrar o app */
  }
  if (import.meta.env.DEV) console.debug('[medir]', evento, props ?? '');
}
