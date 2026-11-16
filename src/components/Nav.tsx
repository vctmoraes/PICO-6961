import { rota } from '../lib/rota';
import { Icone, type NomeIcone } from './Icone';

const itens: { id: string; rotulo: string; href: string; icone: NomeIcone }[] = [
  { id: '', rotulo: 'Início', href: rota.inicio, icone: 'casa' },
  { id: 'buscar', rotulo: 'Buscar', href: rota.buscar, icone: 'busca' },
  { id: 'roteiros', rotulo: 'Roteiros', href: rota.roteiros, icone: 'calendario' },
  { id: 'perfil', rotulo: 'Perfil', href: rota.perfil, icone: 'pessoa' }
];

export function Nav({ atual }: { atual: string }) {
  return (
    <nav className="nav" aria-label="Navegação principal">
      {itens.map((i) => (
        <a key={i.id} href={i.href} className={atual === i.id ? 'ativo' : ''} aria-current={atual === i.id ? 'page' : undefined}>
          <Icone nome={i.icone} />
          {i.rotulo}
        </a>
      ))}
    </nav>
  );
}

export function CabecalhoVolta({ titulo, href = rota.inicio }: { titulo: string; href?: string }) {
  return (
    <div className="cabecalho-volta">
      <a href={href} aria-label="Voltar">
        <Icone nome="voltar" tamanho={18} />
      </a>
      <h1>{titulo}</h1>
    </div>
  );
}
