import { config } from '../config';
import { Icone } from './Icone';

/** Dicas de seguro viagem para ski. Com link de afiliado configurado, mostra o botão de cotação. */
export function Seguro() {
  return (
    <section className="cartao-seguro" aria-labelledby="titulo-seguro">
      <h3 id="titulo-seguro">Seguro viagem com cobertura de ski</h3>
      <p>Muitos seguros não cobrem esporte na neve. Antes de comprar, confira se a apólice cobre:</p>
      <ul>
        <li>Acidente durante a prática de ski e snowboard</li>
        <li>Resgate na montanha</li>
        <li>Despesa médica no país da viagem. Nos EUA, o atendimento médico é muito caro: escolha uma cobertura alta</li>
        <li>Equipamento perdido ou quebrado, se você levar o seu</li>
      </ul>
      {config.seguroUrl && (
        <a className="acao primaria" href={config.seguroUrl} target="_blank" rel="noopener sponsored">
          <Icone nome="escudo" tamanho={18} cor="#D9480F" />
          <div>
            <div className="t">Cotar seguro com ski</div>
            <div className="s">Compare preços num site parceiro</div>
          </div>
          <Icone nome="seta" tamanho={16} cor="#5B6660" />
        </a>
      )}
    </section>
  );
}
