import type { Destino } from './destinos';

export interface GrupoChecklist {
  titulo: string;
  itens: string[];
}

const base: GrupoChecklist[] = [
  {
    titulo: 'Roupa',
    itens: [
      'Jaqueta impermeável',
      'Calça impermeável',
      'Camada térmica (segunda pele) de cima e de baixo',
      'Fleece ou casaco de camada intermediária',
      'Meia própria para ski (2 a 3 pares)',
      'Luva impermeável',
      'Gorro e balaclava ou bandana para o pescoço'
    ]
  },
  {
    titulo: 'Equipamento',
    itens: [
      'Óculos de neve (goggle)',
      'Capacete (próprio ou alugado)',
      'Ski ou snowboard, bota e bastão (próprio ou alugado)',
      'Mochila pequena para a montanha'
    ]
  },
  {
    titulo: 'Saúde e proteção',
    itens: ['Protetor solar FPS 50', 'Protetor labial com FPS', 'Óculos de sol para fora da pista', 'Remédio de uso pessoal']
  },
];

function documentos(d: Destino): GrupoChecklist {
  const comuns = ['Seguro viagem com cobertura para esporte na neve', 'Cartão de crédito internacional', 'Reserva de hospedagem e transfer'];
  if (d.pais === 'Estados Unidos') {
    return {
      titulo: 'Documentos',
      itens: [
        'Passaporte válido',
        'Visto americano válido (brasileiro precisa de visto para os EUA)',
        'Seguro com cobertura médica alta: atendimento médico nos EUA é muito caro',
        ...comuns.slice(1),
        'Carteira de motorista (e Permissão Internacional para Dirigir), se for alugar carro'
      ]
    };
  }
  return { titulo: 'Documentos', itens: ['RG (emitido há menos de 10 anos) ou passaporte', ...comuns] };
}

/** Checklist do destino: lista base + itens que dependem do destino. */
export function checklistDoDestino(d: Destino): GrupoChecklist[] {
  const extras: string[] = [];
  if (d.altitudeBase >= 2500) extras.push('Plano para a altitude: beba muita água e vá devagar no primeiro dia');
  if (d.pais === 'Chile') extras.push('Corrente para o pneu, se for de carro (exigida na subida com neve)');
  if (d.pais === 'Argentina') extras.push('Dinheiro em espécie (peso argentino) para gasto pequeno');
  if (d.nivel === 'avancado') extras.push('Kit de avalanche (ARVA, pá e sonda) se for para fora de pista, com guia');
  if (d.pais === 'Estados Unidos') extras.push('Corrente ou pneu de neve, se for de carro pela montanha');
  const grupos = [...base, documentos(d)];
  return extras.length ? [...grupos, { titulo: `Para ${d.nome}`, itens: extras }] : grupos;
}
