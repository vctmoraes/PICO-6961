import { CabecalhoVolta } from '../components/Nav';
import { Seguro } from '../components/Seguro';
import { buscarDestino } from '../data/destinos';
import { rota } from '../lib/rota';

// Os motivos abaixo vêm da descrição e da logística no catálogo, não de condições ao vivo.
const escolhas = [
  { id: 'el-colorado', motivo: 'Perto de Santiago, com pistas fáceis na área de Farellones.' },
  { id: 'chapelco', motivo: 'Pistas entre árvores e San Martín de los Andes como cidade-base.' },
  { id: 'los-puquios', motivo: 'Parque de neve menor na região de Mendoza, voltado a iniciantes.' }
];

export function Guia() {
  return (
    <main className="conteudo texto-longo descoberta">
      <CabecalhoVolta titulo="Primeira vez na neve" />
      <p>Escolha uma montanha para aprender, veja quando ir e separe o que precisa reservar.</p>

      <h2>Por onde começar?</h2>
      <p>Procure pistas fáceis, escola e um trajeto que caiba no roteiro. Estas três opções do catálogo atendem a perfis de viagem diferentes:</p>
      <ul className="guia-escolhas">
        {escolhas.map(({ id, motivo }) => {
          const d = buscarDestino(id);
          return d && <li key={id}><a href={rota.destino(id)}>{d.nome} · {d.pais}</a><p>{motivo}</p></li>;
        })}
      </ul>
      <div className="guia-acoes">
        <a className="botao contorno curto" href={rota.comparar(escolhas.map(({ id }) => id))}>Comparar as três opções</a>
        <a className="botao contorno curto" href={rota.buscarIniciantes}>Ver todos para iniciantes</a>
      </div>

      <h2>Quando ir?</h2>
      <ul>
        <li>
          <strong>Julho:</strong> férias escolares no Brasil, no Chile e na Argentina. Tem mais gente, mais fila e preço mais alto.
        </li>
        <li>
          <strong>Agosto:</strong> em geral, a base de neve está maior. Fora das férias, tem menos fila.
        </li>
        <li>
          <strong>Setembro:</strong> dias mais longos e mais sol. A neve pode ficar dura de manhã e mole à tarde.
        </li>
      </ul>
      <p>Nos Estados Unidos, a temporada é no nosso verão: em geral, de dezembro a março. As férias de fim de ano e a semana do Carnaval enchem as montanhas.</p>
      <p>A neve muda de ano para ano. Confira a condição no app antes de comprar o passe.</p>

      <h2>O que reservar primeiro?</h2>
      <h3>Aula nos primeiros dias</h3>
      <p>No ski, costuma ser mais fácil se equilibrar no primeiro dia. No snowboard, as quedas são mais comuns no início. Se tiver dúvida, escolha um e experimente na aula antes de comprar equipamento.</p>
      <p>Faça aula com instrutor nos 2 ou 3 primeiros dias. Você aprende a frear e a virar com segurança, e evita machucado.</p>
      <p>A aula em grupo custa menos. A aula particular rende mais. Pergunte na escola se tem instrutor que fala português ou espanhol devagar.</p>

      <h3>Equipamento e passe</h3>
      <p>Na primeira viagem, alugue ski, bota, bastão e capacete. Não compre equipamento antes de saber se você gosta.</p>
      <p>Na cidade, o aluguel em geral sai mais barato que na montanha. Prove a bota com a meia de ski: a bota deve ficar firme, sem apertar o dedo.</p>
      <p>Na tela de cada destino, o cartão “Quanto custa 1 dia na montanha” mostra os valores disponíveis de aluguel e passe, em reais quando há cotação.</p>
      <p>Não sabe o que pedir na loja? Veja o <a href={rota.equipamento}>ski ou a prancha para você</a>, com o tamanho de partida e as pistas certas.</p>

      <h2>Como se preparar?</h2>
      <h3>Vista-se em camadas</h3>
      <ul>
        <li>Camada 1: segunda pele térmica (nunca algodão).</li>
        <li>Camada 2: fleece ou casaco leve.</li>
        <li>Camada 3: jaqueta e calça impermeáveis.</li>
      </ul>
      <p>Use luva impermeável, goggle e protetor solar. O sol na neve queima mais que na praia. Veja o checklist completo na tela de cada destino.</p>

      <h3>Altitude</h3>
      <p>Os resorts perto de Santiago ficam entre 2.400 m e 3.700 m de altitude. Beba muita água, vá devagar no primeiro dia e evite álcool na primeira noite.</p>

      <h3>Segurança na pista</h3>
      <ul>
        <li>Quem está abaixo de você tem a preferência. Desvie dessa pessoa.</li>
        <li>Não pare no meio da pista nem logo depois de uma curva. Pare na lateral.</li>
        <li>Olhe para cima antes de entrar numa pista ou de começar a descer.</li>
        <li>Respeite a placa de pista fechada. Fora de pista, só com guia.</li>
        <li>Use capacete.</li>
      </ul>

      <h3>Documentos e seguro</h3>
      <p>Brasileiro entra no Chile e na Argentina com passaporte ou RG em bom estado. Para os Estados Unidos, você precisa de passaporte e de visto americano. Confira a regra atual antes de viajar, no site oficial do governo do país.</p>
      <Seguro />

      <h2>Transforme a escolha em roteiro</h2>
      <p>
        Use os <a href={rota.roteiros}>Roteiros</a> para escolher as datas, os destinos e o dia a dia. O app calcula o custo estimado do passe.
      </p>
      <p className="aviso">O PICO 6961 só informa. A decisão de praticar o esporte é sua.</p>
    </main>
  );
}
