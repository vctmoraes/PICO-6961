import { CabecalhoVolta } from '../components/Nav';
import { Seguro } from '../components/Seguro';
import { destinos } from '../data/destinos';
import { rota } from '../lib/rota';

// Guia para quem nunca esquiou. Texto curado: frase curta, voz ativa, sem número inventado.
export function Guia() {
  const iniciantes = destinos.filter((d) => d.nivel === 'iniciante');
  return (
    <main className="conteudo texto-longo">
      <CabecalhoVolta titulo="Primeira vez na neve" />
      <p>Este guia é para quem nunca esquiou. Leia antes de escolher o destino e de comprar o passe.</p>

      <h2>1. Ski ou snowboard?</h2>
      <p>No primeiro dia, o ski costuma ser mais fácil. Você fica em pé e anda mais rápido.</p>
      <p>No snowboard, os primeiros dias têm mais queda. Depois da fase inicial, muita gente evolui rápido.</p>
      <p>Na dúvida, comece pelo ski. Você pode trocar no meio da viagem.</p>

      <h2>2. Escolha um destino bom para iniciante</h2>
      <p>Procure uma área grande de pista fácil (verde) e uma escola de ski. Estes destinos têm o nível “Iniciante” no Pico Trip:</p>
      <ul>
        {iniciantes.map((d) => (
          <li key={d.id}>
            <a href={rota.destino(d.id)}>{d.nome}</a> ({d.pais})
          </li>
        ))}
      </ul>
      <p>Um destino “Intermediário” também serve, se tiver área de iniciante. Use a função <a href={rota.comparar([])}>Comparar destinos</a>.</p>

      <h2>3. Escolha a época</h2>
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
      <p>A neve muda de ano para ano. Confira a condição no app antes de comprar o passe.</p>

      <h2>4. Faça aula nos primeiros dias</h2>
      <p>Faça aula com instrutor nos 2 ou 3 primeiros dias. Você aprende a frear e a virar com segurança, e evita machucado.</p>
      <p>A aula em grupo custa menos. A aula particular rende mais. Pergunte na escola se tem instrutor que fala português ou espanhol devagar.</p>

      <h2>5. Alugue o equipamento</h2>
      <p>Na primeira viagem, alugue ski, bota, bastão e capacete. Não compre equipamento antes de saber se você gosta.</p>
      <p>Na cidade, o aluguel em geral sai mais barato que na montanha. Prove a bota com a meia de ski: a bota deve ficar firme, sem apertar o dedo.</p>

      <h2>6. Vista-se em camadas</h2>
      <ul>
        <li>Camada 1: segunda pele térmica (nunca algodão).</li>
        <li>Camada 2: fleece ou casaco leve.</li>
        <li>Camada 3: jaqueta e calça impermeáveis.</li>
      </ul>
      <p>Use luva impermeável, goggle e protetor solar. O sol na neve queima mais que na praia. Veja o checklist completo na tela de cada destino.</p>

      <h2>7. Cuide da altitude</h2>
      <p>Os resorts perto de Santiago ficam entre 2.400 m e 3.700 m de altitude. Beba muita água, vá devagar no primeiro dia e evite álcool na primeira noite.</p>

      <h2>8. Regras de segurança na pista</h2>
      <ul>
        <li>Quem está abaixo de você tem a preferência. Desvie dessa pessoa.</li>
        <li>Não pare no meio da pista nem logo depois de uma curva. Pare na lateral.</li>
        <li>Olhe para cima antes de entrar numa pista ou de começar a descer.</li>
        <li>Respeite a placa de pista fechada. Fora de pista, só com guia.</li>
        <li>Use capacete.</li>
      </ul>

      <h2>9. Documentos</h2>
      <p>Brasileiro entra no Chile e na Argentina com passaporte ou RG em bom estado. Confira a regra atual antes de viajar, no site oficial do governo do país.</p>
      <Seguro />

      <h2>10. Monte o roteiro</h2>
      <p>
        Use os <a href={rota.roteiros}>Roteiros</a> para escolher as datas, os destinos e o dia a dia. O app calcula o custo estimado do passe.
      </p>
      <p className="aviso">O Pico Trip só informa. A decisão de praticar o esporte é sua.</p>
    </main>
  );
}
