// Ícones de traço (mesmo estilo do mockup). Decorativos: aria-hidden.
const caminhos = {
  busca: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  casa: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  calendario: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></>,
  pessoa: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  voltar: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  marcador: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  ticket: <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 1 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 1 0 0-4z" />,
  cama: <><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></>,
  seta: <polyline points="9 6 15 12 9 18" />,
  baixo: <polyline points="6 9 12 15 18 9" />
};

export type NomeIcone = keyof typeof caminhos;

export function Icone({ nome, tamanho = 20, cor = 'currentColor', cheio = false }: { nome: NomeIcone; tamanho?: number; cor?: string; cheio?: boolean }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill={cheio ? cor : 'none'} stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {caminhos[nome]}
    </svg>
  );
}
