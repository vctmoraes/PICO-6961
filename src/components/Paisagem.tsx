import type { Destino } from '../data/destinos';

// Ilustração de montanha com as cores do destino.
// Fica no lugar da foto até termos foto com licença confirmada (ver docs/fotos-e-licencas.md).
export function Paisagem({ destino, className }: { destino: Destino; className?: string }) {
  const [c1, c2] = destino.cor;
  if (destino.foto) {
    return (
      <img
        className={className}
        src={destino.foto.url}
        alt={`Foto de ${destino.nome}`}
        title={`Foto: ${destino.foto.autor} (${destino.foto.licenca})`}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    );
  }
  return (
    <svg className={className} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label={`Ilustração de ${destino.nome}`}>
      <rect width="160" height="100" fill={c1} />
      <circle cx="70" cy="22" r="7" fill="#FFFFFF" opacity="0.25" />
      <path d="M0 100 L38 42 L60 70 L92 24 L160 100 Z" fill={c2} />
      <path d="M92 24 L104 42 L97 39 L92 46 L86 38 L80 41 Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M38 42 L46 54 L40 52 L35 57 L30 54 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M0 100 L0 78 L30 64 L70 84 L118 60 L160 76 L160 100 Z" fill="#FFFFFF" opacity="0.18" />
    </svg>
  );
}
