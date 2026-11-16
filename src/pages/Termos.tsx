import { CabecalhoVolta } from '../components/Nav';
import { rota } from '../lib/rota';

// RASCUNHO. Antes de lançar ao público, peça a revisão de um advogado.
export function Termos() {
  return (
    <main className="conteudo texto-longo">
      <CabecalhoVolta titulo="Termos de uso" href={rota.perfil} />
      <p className="legenda">Rascunho da versão de teste.</p>

      <h2>1. O que o PICO 6961 faz</h2>
      <p>O PICO 6961 reúne informação para planejar viagem de esporte radical. O app só informa. O app não vende passe, hospedagem nem outro serviço.</p>

      <h2>2. Isenção de responsabilidade</h2>
      <p>A decisão de praticar o esporte é sua. Esporte na neve tem risco de acidente, de avalanche e de mudança rápida do tempo.</p>
      <p>A condição de neve e tempo vem de um modelo meteorológico. A condição real na montanha pode ser diferente. Confira sempre o boletim oficial do resort.</p>
      <p>Preço, horário e regra mudam sem aviso. Confira o valor no site oficial antes de comprar. O PICO 6961 não responde por dano causado por informação desatualizada ou errada.</p>

      <h2>3. Links de terceiros e comissão</h2>
      <p>Alguns links levam a site de terceiros, como o site oficial do resort ou um site de reserva de hotel. O PICO 6961 pode receber comissão quando você compra por esses links. O preço para você não muda.</p>
      <p>A compra, o pagamento, o cancelamento e o reembolso são feitos com o terceiro. As regras do terceiro se aplicam.</p>

      <h2>4. Conteúdo que você publica</h2>
      <p>Você mantém o direito sobre o relato e a foto que publica. Ao publicar, você dá ao PICO 6961 uma licença gratuita para exibir esse conteúdo no app.</p>
      <p>Não publique conteúdo de outra pessoa sem permissão. Não publique conteúdo ofensivo ou falso.</p>

      <h2>5. Grupos de viagem</h2>
      <p>Para usar os grupos, você precisa ter 16 anos ou mais e entrar com o seu e-mail.</p>
      <p>O que você manda no grupo fica salvo no servidor do PICO 6961 (Supabase). Só as pessoas do grupo veem as mensagens, o roteiro e os votos.</p>
      <p>Regras: respeite as pessoas. Não mande conteúdo ofensivo, ilegal, falso, propaganda ou dado pessoal de outra pessoa. Você pode denunciar uma mensagem e bloquear uma pessoa. A equipe analisa as denúncias e pode apagar mensagens e contas que quebram as regras.</p>
      <p>Você pode apagar as suas mensagens e a sua conta quando quiser, na tela Perfil.</p>

      <h2>6. Privacidade</h2>
      <p>Nesta versão de teste, seu nome, seu perfil de viagem, seus roteiros, seus destinos salvos, seu checklist, seus relatos e o seu Passaporte de Picos ficam salvos só neste aparelho. O PICO 6961 não recebe esses dados.</p>
      <p>O perfil de viagem tem só o que o app usa para recomendar destinos e montar o checklist. O app não pede número de documento. Você pode baixar, ver e apagar os seus dados na tela Perfil.</p>
      <p>O app pode medir o número de visitas de forma anônima, sem cookie e sem dado pessoal.</p>
    </main>
  );
}

export function Creditos() {
  return (
    <main className="conteudo texto-longo">
      <CabecalhoVolta titulo="Créditos" href={rota.perfil} />
      <h2>Dados de tempo e neve</h2>
      <p>
        <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a>, licença CC BY 4.0.
      </p>
      <h2>Cotação do real</h2>
      <p>
        <a href="https://docs.awesomeapi.com.br/api-de-moedas" target="_blank" rel="noopener">AwesomeAPI</a>. O valor em real é estimado e serve só de referência.
      </p>
      <h2>Mapas</h2>
      <p>
        Mapa do destino: Google Maps. Mapa dos destinos e do roteiro: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>,
        com a biblioteca Leaflet.
      </p>
      <h2>Fontes tipográficas</h2>
      <p>Inter e Space Grotesk, licença SIL Open Font License, pelo Google Fonts.</p>
      <h2>Imagens</h2>
      <p>As ilustrações de montanha são do próprio PICO 6961. Foto de destino só entra no app com autor e licença confirmados.</p>
      <h2>Conteúdo dos destinos</h2>
      <p>
        Destinos dos Estados Unidos: <a href="https://openskimap.org" target="_blank" rel="noopener">OpenSkiMap</a>, com dados do{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>, licença ODbL.
      </p>
      <p>Curadoria do PICO 6961. Preço de passe e informação de resort vêm do site oficial de cada resort.</p>
    </main>
  );
}
