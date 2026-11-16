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
  camera: <><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></>,
  montanha: <><path d="M3 20l6-11 4 6 3-4 5 9z" /><circle cx="17" cy="6" r="2" /></>,
  escudo: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  livro: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  comparar: <><rect x="3" y="4" width="7" height="16" rx="1" /><rect x="14" y="4" width="7" height="16" rx="1" /></>,
  floco: <><line x1="12" y1="2" x2="12" y2="22" /><line x1="4.9" y1="7" x2="19.1" y2="17" /><line x1="4.9" y1="17" x2="19.1" y2="7" /></>,
  pino: <><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  mapa: <><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6" /><line x1="8" y1="3" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="21" /></>,
  aviao: <path d="M2 16l20-6-20-6 3 6-3 6zm3-6h9" />,
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
