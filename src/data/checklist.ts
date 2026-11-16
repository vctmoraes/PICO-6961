import type { Destino } from './destinos';
import type { PerfilViajante } from '../lib/storage';

export interface GrupoChecklist {
  titulo: string;
  itens: string[];
}

const saude: GrupoChecklist = {
  titulo: 'Saúde e proteção',
  itens: ['Protetor solar FPS 50', 'Protetor labial com FPS', 'Óculos de sol para fora da pista', 'Remédio de uso pessoal']
};

function roupa(p: PerfilViajante): GrupoChecklist {
  const sufixo = p.equipamento === 'aluga' ? ' (sua ou alugada)' : '';
  return {
    titulo: 'Roupa',
    itens: [
      `Jaqueta impermeável${sufixo}`,
      `Calça impermeável${sufixo}`,
      'Camada térmica (segunda pele) de cima e de baixo',
      'Fleece ou casaco de camada intermediária',
      'Meia própria para ski (2 a 3 pares)',
      'Luva impermeável',
      'Gorro e balaclava ou bandana para o pescoço'
    ]
  };
}

function equipamento(p: PerfilViajante): GrupoChecklist {
  const prancha =
    p.esporte === 'snowboard' ? 'Prancha e bota de snowboard' : p.esporte === 'ski' ? 'Ski, bota e bastão' : 'Ski ou snowboard, bota e bastão';
  const origem =
    p.equipamento === 'tudo' ? ' (seu, com capa de viagem)' : p.equipamento ? ' (reserve o aluguel com antecedência)' : ' (próprio ou alugado)';
  return {
    titulo: 'Equipamento',
    itens: [
      'Óculos de neve (goggle)',
      p.equipamento === 'tudo' ? 'Capacete (seu)' : 'Capacete (próprio ou alugado)',
      prancha + origem,
      'Mochila pequena para a montanha'
    ]
  };
}

function documentos(d: Destino, p: PerfilViajante): GrupoChecklist {
  const comuns = ['Seguro viagem com cobertura para esporte na neve', 'Cartão de crédito internacional', 'Reserva de hospedagem e transfer'];
  if (d.pais === 'Estados Unidos') {
    const itens: string[] = [];
    if (p.passaporte === false) itens.push('Tirar o passaporte na Polícia Federal');
    else itens.push('Passaporte válido');
    if (p.vistoEua === false) itens.push('Tirar o visto americano: o processo pode levar meses. Comece cedo');
    else itens.push('Visto americano válido (brasileiro precisa de visto para os EUA)');
    itens.push(
      'Seguro com cobertura médica alta: atendimento médico nos EUA é muito caro',
      ...comuns.slice(1),
      'Carteira de motorista (e Permissão Internacional para Dirigir), se for alugar carro'
    );
    return { titulo: 'Documentos', itens };
  }
  return { titulo: 'Documentos', itens: ['RG (emitido há menos de 10 anos) ou passaporte', ...comuns] };
}

const criancas: GrupoChecklist = {
  titulo: 'Crianças',
  itens: [
    'Roupa de neve e luva extra para cada criança',
    'Capacete infantil (próprio ou alugado)',
    'Documento de cada criança',
    'Autorização de viagem de menor, se a criança viajar sem os 2 pais',
    'Reserva da escola de ski infantil'
  ]
};
/** Checklist do destino: lista base + itens do destino + itens do perfil do viajante. */
export function checklistDoDestino(d: Destino, p: PerfilViajante = {}): GrupoChecklist[] {
  const extras: string[] = [];
  if (p.nivel === 'nunca' || p.nivel === 'iniciante') extras.push('Reserva de aula para os 2 ou 3 primeiros dias');
  if ((p.passe === 'epic' && d.rede === 'Epic Pass') || (p.passe === 'ikon' && d.rede === 'Ikon Pass')) extras.push(`Seu ${d.rede} (vale aqui)`);
  if (d.altitudeBase >= 2500) extras.push('Plano para a altitude: beba muita água e vá devagar no primeiro dia');
  if (d.pais === 'Chile') extras.push('Corrente para o pneu, se for de carro (exigida na subida com neve)');
  if (d.pais === 'Argentina') extras.push('Dinheiro em espécie (peso argentino) para gasto pequeno');
  if (d.nivel === 'avancado') extras.push('Kit de avalanche (ARVA, pá e sonda) se for para fora de pista, com guia');
  if (d.pais === 'Estados Unidos') extras.push('Corrente ou pneu de neve, se for de carro pela montanha');
  const grupos = [roupa(p), equipamento(p), saude, documentos(d, p), ...(p.grupo === 'familia' ? [criancas] : [])];
  return extras.length ? [...grupos, { titulo: `Para ${d.nome}`, itens: extras }] : grupos;
}
