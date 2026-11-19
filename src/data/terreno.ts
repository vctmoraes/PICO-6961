// Terreno dos destinos com fonte: site oficial do resort (ou turismo oficial), pesquisado em 2026-11-19.
// Só entra fato com link. Sem fonte, o destino fica fora desta lista e o app usa só o texto curado.
// Pesquisa completa e fatos com menos certeza: docs/terreno-e-pistas.md.
// Ficaram de fora por pouca certeza: snowpark de Las Leñas (lido só na imagem do mapa) e Ski Pucón (o site virou "Centro Pillán").
// Teleférico de arrasto só entra onde a fonte diz que ele pesa para o iniciante.
import type { TagTerreno } from './equipamento';

export interface FatoTerreno {
  tag: TagTerreno;
  /** Rótulo curto para a tela. */
  texto: string;
  /** Detalhe da fonte, em uma frase. */
  detalhe: string;
  /** Página que sustenta o fato. */
  fonte: string;
}

/** Data da pesquisa (AAAA-MM-DD). */
export const terrenoVerificadoEm = '2026-11-19';

const porDestino: Record<string, FatoTerreno[]> = {
  "valle-nevado": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Status oficial lista a pista 'Snowpark' e uma pista de 'Boarder Cross' (seção Freestyle, setor Prado/Góndola); o mapa tem símbolos de snowpark e boardercross.", fonte: "https://www.vallenevado.com/es/pistas/" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Freeride é uma categoria própria (◆◆ preto), com setores marcados: El Dedo, La Ola e Cerro Amarillo. O relatório oficial alerta para setores de freeride instáveis e risco de avalanche e pede para ficar dentro dos limites. O resort também oferece heliski.", fonte: "https://www.vallenevado.com/es/pistas/" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "A legenda do mapa oficial tem um símbolo próprio para 'Bumps' (moguls).", fonte: "https://www.vallenevado.com/wp-content/uploads/2024/03/MAPA-DE-PISTAS.pdf" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Categoria 'Principiantes' (círculo verde). A legenda do mapa inclui cinta transportadora (magic carpet).", fonte: "https://www.vallenevado.com/wp-content/uploads/2024/03/MAPA-DE-PISTAS.pdf" },
  ],
  "la-parva": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Status oficial lista 'Mini Snow Park' entre as pistas principais; o mapa 2026 tem símbolo de Snowpark.", fonte: "https://laparva.cl/es/reporte-de-montana/pistas-y-andariveles/" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Status oficial tem a categoria 'Freeride'. O mapa 2026 delimita zonas 'Fuera de Pista' e marca o limite do domínio esquiável.", fonte: "https://laparva.cl/es/reporte-de-montana/pistas-y-andariveles/" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "'School Camp Area', exclusiva da escola: pistas progressivas, circuitos didáticos e os andariveis Golondrina, Ositos, Manzanito e Paloma. O acesso é pelo ticket School Camp, incluído nas aulas de iniciante.", fonte: "https://laparva.cl/en/ski-snowboard-school/" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "São 15 andariveis: 5 telesillas e 10 de 'mecanismo de arrastre'. A maioria é de arrasto, o que pesa contra o snowboarder iniciante.", fonte: "https://laparva.cl/es/reporte-de-montana/pistas-y-andariveles/" },
  ],
  "el-colorado": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Sunset Park tem módulos, rails e saltos e recebe eventos de freestyle; o resort diz ter 'o maior snowpark da América do Sul'. O status lista também 'Snowpark Colorado Chico', 'Snowpark El Colorado' e 'Halfpipe'.", fonte: "https://www.elcolorado.cl/snowpark/" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "O reporte oficial lista as pistas 'Free Style Moguls' e 'Exhibición Bumps Cornisa' (Zona Alta).", fonte: "https://www.elcolorado.cl/pistas" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "A Zona Baja tem pistas curtas (El Zorrito, Las Papas, El Quiosko) e a esteira 'Magic Carpet Zorros'.", fonte: "https://www.elcolorado.cl/pistas" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "A maioria dos andariveis é telesquí: Embudo, Zorros I/II, Slalom, Colorado Chico I/II, Yaretas, Liebre, Cornisa, Cono Este, La Copa e Pioneros. Telesillas: Pingüino, Cururo, León e Cóndor.", fonte: "https://www.elcolorado.cl/pistas" },
  ],
  "portillo": [
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Fora de pista desafiador, com powder, acessado pelos lifts mais altos. Zonas pretas e amarelas para avançados e experts; mundialmente conhecido pelo off-piste.", fonte: "https://skiportillo.com/en/portillo-trail-map-complete-guide-to-understanding-the-mountain/" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Zonas verdes ao lado do hotel (El Corralito, El Puma): encostas largas, suaves e protegidas, usadas pela escola.", fonte: "https://skiportillo.com/en/portillo-trail-map-complete-guide-to-understanding-the-mountain/" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "São 14 lifts, incluindo arrastes e os va-et-vient (Roca Jack, El Caracara), que exigem segurar a borda em encosta íngreme. São muito difíceis de prancha; recomenda-se consultar a Ski Patrol antes.", fonte: "https://skiportillo.com/en/portillo-trail-map-complete-guide-to-understanding-the-mountain/" },
  ],
  "cerro-catedral": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Snow Park no setor Nubes, com obstáculos e módulos de vários níveis para esquiadores e snowboarders. Em 2026, o acesso de esquiadores passou a exigir o produto 'Snow Park Esquiador' (seguro de $3.000, ChipCard própria).", fonte: "https://catedralaltapatagonia.com/novedades/snow-park-el-sector-de-freestyle-de-cerro-catedral-nuevo-producto-para-acceder-a-la-pista-exclusiva/" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "O que fica fora das zonas balizadas é responsabilidade de cada um. Recomenda-se ir em grupo, com alguém que conheça o terreno, e levar capacete, mochila, pá, ARVA, sonda e RECCO. O resgate fora de pista tem custo adicional.", fonte: "https://catedralaltapatagonia.com/seguridad/" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Zona de aprendizagem ao pé da montanha: Play Park (primeiro contato) → pista Zorrito, larga e perfilada, pela telesilla Princesita. O mapa mostra os Magic Carpets M1–M5 e a área de principiantes.", fonte: "https://catedralaltapatagonia.com/actividades_esqui/" },
  ],
  "chapelco": [
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "A legenda do mapa oficial tem 'Fuera de Pista' e 'Itinerario'; há uma zona fora de pista identificada (La Pala).", fonte: "https://www.cerrochapelco.com.ar/wp-content/uploads/2026/09/mapa-pistas-ch.jpg" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Jardín de Nieve (crianças) e 2 alfombras (magic carpets) no setor da cota 1600.", fonte: "https://www.cerrochapelco.com.ar/esqui_snowboard/" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "São 12 meios: 1 telecabina, 5 telesillas, 4 T-bar e 2 alfombras.", fonte: "https://www.cerrochapelco.com.ar/esqui_snowboard/" },
  ],
  "las-lenas": [
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Fora de pista no domínio exige passe, termo de responsabilidade assinado (pulseira), capacete, pá, sonda e DVA. Antes, confira os setores abertos e o risco de avalanche. É para pessoas com experiência. A escola oferece aulas de fora de pista e o mapa marca os acessos.", fonte: "https://laslenas.com/reglas-para-esquiadores-fuera-de-pista/" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Parque Infantil (Kid's Zone) e uma Magic Carpet em operação.", fonte: "https://laslenas.com/estado-pistas/" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "Vários teleskis (Tk Iris, Eros I/II, Minerva, Urano, Venus II) e sogalifts (Aries, Piscis), além das telesillas.", fonte: "https://laslenas.com/estado-pistas/" },
  ],
  "cerro-castor": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Castor Park: 4 saltos sobre lombadas de terra, abertos a temporada toda; zona de iniciantes com doobies, caixas e corrimãos planos; rails redondos e planos e double kinks. Fica sob a Telesilla Del Parque, cercado por bosque de lengas.", fonte: "https://www.cerrocastor.com/es_ar/castor-park.html" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "A legenda do mapa oficial 2025 inclui 'Fuera de Pista'; não há detalhe sobre regras.", fonte: "https://www.cerrocastor.com/CMS/Servidor/CerroCastor/Documentos/Documentos/MAPA2025_CC_OUT-media.jpg" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "O mapa marca 'Área Principiante' e 'Alfombra Transportadora'. O status lista pistas curtas Castorcitos I–III (40–100 m) e Lobitos.", fonte: "https://www.cerrocastor.com/es_ar/estado-pistas-medios.html" },
  ],
  "nevados-de-chillan": [
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "O mapa marca 'Área Freeride – Riesgos Naturales'. Fora das zonas designadas é backcountry, sem vigilância e com risco alto e permanente de avalanche. São 10.000 ha de domínio, 500 ha habilitados.", fonte: "https://www.nevadosdechillan.com/andariveles-y-pistas" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Zona Debutantes em Plaza Tata: grande explanada de baixa inclinação, com escola, rental, andarivel de arrasto (Cascada 2) e cinta transportadora; há 'ticket debutantes' específico.", fonte: "https://www.nevadosdechillan.com/andariveles-y-pistas" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "Pelo mapa: arrastes Cascada I/II, Novicios, Novatos, Cornisa, Nono e Enlace, e 3 magic carpets. O andarivel de iniciante é de arrasto, o que pesa contra o snowboarder iniciante.", fonte: "https://www.nevadosdechillan.com/storage/mapas-pistas/documentos/01K3HF0VZXWNXBWVC2Q9R9JDPY.pdf" },
  ],
  "corralco": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "O mapa 2026 marca uma área 'Snowpark'. O 'Parque de Nieve Los Zorros' é outra coisa: tubing e trenó.", fonte: "https://corralco.com/wp-content/uploads/2026/06/Mapa-de-Pistas_2026_WEB_OK.jpg-1536x1536.jpeg" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "O mapa separa zonas 'Freeride Patrullado' e 'Freeride No Patrullado' (◆◆ amarelo) e mostra a rota 'Ascensión Volcán'.", fonte: "https://corralco.com/wp-content/uploads/2026/06/Mapa-de-Pistas_2026_WEB_OK.jpg-1536x1536.jpeg" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Zona de aprendizado no Zorro con Botas, com cinta transportadora e o lift 'Escuelita' (pistas Escuelita Adultos/Niños).", fonte: "https://corralco.com/montana/" },
    { tag: "teleski", texto: "Teleférico de arrasto", detalhe: "Arrastes: Parque Zorros, Escuelita, Cruce, Coloradito, Cumbre e Navidad. O site diz 'cuatro de arrastre' mas lista seis nomes.", fonte: "https://corralco.com/montana/" },
  ],
  "cerro-bayo": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "O status oficial lista 'Snow Park', e o site tem a seção 'Snowparks'.", fonte: "https://www.cerrobayo.com.ar/montana/estado/" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "4 itinerários fora de pista, com mais de 4 km, não patrulhados.", fonte: "https://www.cerrobayo.com.ar/montana/ficha/" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "'Área de Principiantes' (Principiantes 1–3) com 3 magic carpets.", fonte: "https://www.cerrobayo.com.ar/montana/estado/" },
  ],
  "la-hoya": [
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Cânions ('cañadones') fora de pista com powder, para avançados. A fonte é o site de turismo do governo argentino, não o resort.", fonte: "https://www.argentina.gob.ar/viaja-por-argentina/que-hacer/esquiar-fuera-de-pista-en-la-hoya" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Setor de aprendizado na cota 1600, com pista ampla e segura e a escola oficial.", fonte: "https://skilahoya.com/esqui_snowboard/" },
  ],
  "vail-co": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Dois terrain parks, de features profissionais a saltos para iniciantes e crianças. O maior fica em Golden Peak, sob a Riva Bahn. Os tamanhos são relativos ao resort.", fonte: "https://www.vail.com/the-mountain/about-the-mountain/terrain-parks.aspx" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Cerca de 3.000 acres de Back Bowls (7 bowls) dentro dos limites, incluindo terreno expert com penhascos, couloirs e cornijas. Blue Sky Basin e Mongolia têm sensação de backcountry. A política de saída para o backcountry não foi pesquisada.", fonte: "https://www.vail.com/the-mountain/about-the-mountain/the-back-bowls.aspx" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Tea Cup Glade (álamos fechados com pequenos penhascos), glades de baixa inclinação em Siberia Bowl e glades preparados em Blue Sky Basin.", fonte: "https://www.vail.com/the-mountain/about-the-mountain/the-back-bowls.aspx" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "Wild Card (Game Creek Bowl) tem moguls.", fonte: "https://www.vail.com/the-mountain/about-the-mountain/the-back-bowls.aspx" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Golden Peak é a principal área de aprendizado e base da escola, com terreno suave; indicada para snowboarder iniciante.", fonte: "https://www.vail.com/travel-guide/beginner-skiing-guide.aspx" },
  ],
  "breckenridge-ski-resort-co": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "3 terrain parks com tamanhos Extra Small, Small, Medium e Large, relativos a Breck.", fonte: "https://www.breckenridge.com/the-mountain/about-the-mountain/safety/terrain-parks.aspx" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "High alpine acima da linha das árvores: Horseshoe e Imperial Bowls, Lake Chutes, as chutes 'Six Senses' do Peak 6 e zonas hike-to acima de 12.000 pés, todos dentro dos limites.", fonte: "https://www.breckenridge.com/explore-the-resort/activities-and-events/winter-activities/high-alpine-skiing.aspx" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Ore Bucket (glade preta) e as Windows (double black estreita entre árvores).", fonte: "https://www.breckenridge.com/travel-guide/unmissable-expert-trails-breckenridge.aspx" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "Shock, Pika e White Crown têm moguls.", fonte: "https://www.breckenridge.com/travel-guide/unmissable-expert-trails-breckenridge.aspx" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Peak 9 tem encostas largas e suaves e a escola; a Rip's Ride Learning Area, no Peak 8, tem carpet lifts.", fonte: "https://www.breckenridge.com/travel-guide/learning-skiing-for-beginners.aspx" },
  ],
  "aspen-snowmass-co": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Em Snowmass: Lowdown (XS–M, com half-pipe de iniciante), Makaha (M–L) e Snowmass Park (M–L), com mais de 100 features. Em Buttermilk: parks e pipe do X Games e o Boot Camp Park, para iniciantes.", fonte: "https://www.aspensnowmass.com/four-mountains/snowmass/parks-and-pipes" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Highland Bowl (Aspen Highlands): 270 acres, só para experts, todas as linhas double black (38–48°). O acesso é por subida a pé de cerca de 782 pés. Abre por volta das 10h às 14h30, mais tarde quando há mitigação de avalanche.", fonte: "https://www.aspensnowmass.com/discover/experiences/guides/everything-you-should-know-about-highland-bowl" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Snowmass tem 'inviting glades' e Aspen Mountain tem 'steep, gladed runs'.", fonte: "https://www.aspensnowmass.com/four-mountains/snowmass" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "Aspen Mountain é conhecida por 'iconic bumps', e Snowmass também tem bumps.", fonte: "https://www.aspensnowmass.com/four-mountains/aspen-mountain" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Buttermilk: Panda Peak (lift gratuito na base), greens suaves e o espaço de aprendizado The Hideout.", fonte: "https://www.aspensnowmass.com/four-mountains/buttermilk" },
  ],
  "park-city-mountain-resort-ut": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "6 terrain parks, half-pipe de 18 pés e mini pipe. Little Kings é para as menores features; Pick Axe e Transitions são para intermediários.", fonte: "https://www.parkcitymountain.com/the-mountain/about-the-mountain/terrain-parks.aspx" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Terreno 'extreme' hike-to em Jupiter Peak (P-Zone, O-Zone) e McConkey's Bowl (double black), dentro dos limites.", fonte: "https://www.parkcitymountain.com/blog/choose-your-own-adventure.aspx" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Tree runs Molly's e Black Forest, na área McConkey's.", fonte: "https://www.parkcitymountain.com/blog/choose-your-own-adventure.aspx" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "McConkey's Bowl costuma ficar coberto de moguls.", fonte: "https://www.parkcitymountain.com/blog/choose-your-own-adventure.aspx" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "High Meadow Park é a área de aprendizado de ski e snowboard.", fonte: "https://www.parkcitymountain.com/the-mountain/about-the-mountain/mountain-info.aspx" },
  ],
  "jackson-hole-mountain-resort-wy": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "2 terrain parks: Antelope Flats, de aprendizado, e Bronco Park, com cerca de duas dúzias de features intermediárias. Há também 4 Burton Stash parks com features naturais.", fonte: "https://www.jacksonhole.com/terrain-parks" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Sistema de portões de backcountry dá acesso a mais de 3.000 acres fora dos limites. É terreno sem controle, com avalanche, penhascos e armadilhas de terreno. A patrulha pede parceiro, plano, equipamento de resgate e experiência. Há guias de backcountry do resort.", fonte: "https://www.jacksonhole.com/blog/safe-backcountry-skiing-at-jackson-hole" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Après Vous tem bastante powder e tree skiing.", fonte: "https://www.jacksonhole.com/intermediate" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Eagle's Rest, na base, é uma pista larga e suave com quad própria; há Kids Adventure Trails e um park de iniciante em Lower Werner.", fonte: "https://www.jacksonhole.com/blog/top-five-beginner-runs" },
  ],
  "mammoth-mountain-ca": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "Unbound: 10 parks, 2 half-pipes (22 pés no Main Park), mais de 100 jibs e mais de 100 acres, do nível iniciante ao expert. O número de saltos aparece como 'até 40' numa página e 'até 50' em outra.", fonte: "https://www.mammothmountain.com/on-the-mountain/unbound-terrain-parks" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Encostas íngremes e bowls de powder dentro dos limites. A política de backcountry não foi pesquisada.", fonte: "https://www.mammothmountain.com/discover-mammoth/winter-first-timers-guide" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "O resort oferece o 'Mogul Ski Camp', de 2 dias, focado em moguls.", fonte: "https://www.mammothmountain.com/discover-mammoth/camps-teams/multi-day-clinics/mogul-ski-camp" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "Eagle Lodge tem terreno suave para iniciantes, e há um mapa ou brochura específico para iniciantes.", fonte: "https://www.mammothmountain.com/discover-mammoth/winter-first-timers-guide" },
  ],
  "palisades-tahoe-olympic-valley-ca": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "A página de estatísticas lista os parks de Palisades: Belmont, Gold Coast, Mainline, SnoVentures Start Park e High Camp Start Park. A página dos picos cita Emigrant Gully (features de baixo risco) e Gold Coast no pico Emigrant.", fonte: "https://www.palisadestahoe.com/footer/mountain-statistics" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "KT-22 tem chutes e faces com penhascos; National Chute e Granite Chief exigem bootpack curto. Palisades tem 16 bowls, todos dentro dos limites.", fonte: "https://www.palisadestahoe.com/8-peaks" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Snow King tem 'thinned glades' e o melhor tree skiing; Scott tem as árvores de Promised Land e Gentian Gully; Granite Chief tem chutes entre árvores.", fonte: "https://www.palisadestahoe.com/8-peaks" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "O resort oferece o 'Mogul Magic Clinic', de técnica em bumps.", fonte: "https://www.palisadestahoe.com/events-and-activities/activity-finder/mogul-magic-clinic" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "High Camp (8.200 pés) tem encostas largas e suaves: Mountain Meadow e Bailey's Beach.", fonte: "https://www.palisadestahoe.com/explore/first-timers-guide" },
  ],
  "big-sky-resort-mt": [
    { tag: "snowpark", texto: "Snowpark", detalhe: "6 terrain parks: Wolf Pup, Cowpoke e Explorer (de entrada), The Cache e Plain Jane, e Swifty, o maior.", fonte: "https://www.bigskyresort.com/mountain-info" },
    { tag: "fora-de-pista", texto: "Fora de pista", detalhe: "Pelo Lone Peak Tram, a descida mais fácil é a Liberty Bowl (black). O Big Couloir (~50°) exige parceiro e registro de saída com a ski patrol. Marx e Lenin são paths de avalanche, e há chutes hike-to. Recomenda-se instrutor para quem não conhece o terreno.", fonte: "https://www.bigskyresort.com/blog/terrain-variety-at-big-sky" },
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "Lois Lane (glade iniciante), Whiskey (glade intermediário) e Broken Heart.", fonte: "https://www.bigskyresort.com/blog/terrain-variety-at-big-sky" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "Highway (Challenger) e as runs de Andesite têm moguls.", fonte: "https://www.bigskyresort.com/blog/terrain-variety-at-big-sky" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "White Wing é a green mais fácil e uma das mais largas. A Explorer Gondola tem estação intermediária para o terreno iniciante.", fonte: "https://www.bigskyresort.com/blog/terrain-variety-at-big-sky" },
  ],
  "deer-valley-resort-ut": [
    { tag: "arvores", texto: "Pistas entre árvores", detalhe: "O terreno da expansão tem 'numerous bowls and gladed areas'.", fonte: "https://expandedexcellence.deervalley.com/major-terrain-expansion/" },
    { tag: "mogul", texto: "Pista de mogul", detalhe: "Sedia a Copa do Mundo FIS de moguls e aerials; a pista Champion recebe o evento de moguls.", fonte: "https://www.deervalley.com/things-to-do/activities/world-cup" },
    { tag: "area-iniciante", texto: "Área para iniciante", detalhe: "27% das pistas são de iniciante, com runs iniciantes em 5 das 6 montanhas.", fonte: "https://www.deervalley.com/about-us/faqs" },
    { tag: "sem-snowboard", texto: "Snowboard proibido", detalhe: "Só esquiadores.", fonte: "https://www.deervalley.com/about-us/faqs" },
  ],
};

export function terrenoPesquisado(id: string): FatoTerreno[] {
  return porDestino[id] ?? [];
}
