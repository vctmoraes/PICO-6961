import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Destino } from '../data/destinos';
import { viagens } from '../lib/storage';
import { rota } from '../lib/rota';
import { medir } from '../lib/medir';

/** Escolhe um roteiro local ou salva um rascunho com o destino. */
export function AdicionarAoRoteiro({ destino, aoFechar }: { destino: Destino; aoFechar: () => void }) {
  const [lista, setLista] = useState(viagens.listar);
  const [nome, setNome] = useState(`Viagem para ${destino.nome}`.slice(0, 60));
  const [adicionadoEm, setAdicionadoEm] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const dialogo = useRef<HTMLDialogElement>(null);
  const abrirRoteiro = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const elemento = dialogo.current!;
    const origem = document.activeElement;
    elemento.showModal();
    return () => {
      elemento.close();
      if (origem instanceof HTMLElement && origem.isConnected) origem.focus();
    };
  }, []);

  useLayoutEffect(() => {
    if (adicionadoEm) abrirRoteiro.current?.focus();
  }, [adicionadoEm]);

  const adicionar = (id: string) => {
    viagens.adicionarDestino(id, destino.id);
    const atual = viagens.listar();
    const salvo = atual.find((v) => v.id === id && v.destinos.includes(destino.id));
    if (!salvo) {
      setMensagem('Não foi possível salvar a alteração neste aparelho. Tente novamente.');
      return;
    }
    setLista(atual);
    setAdicionadoEm(id);
    setMensagem(`Adicionado ao roteiro “${salvo.nome}”.`);
  };

  return (
    <dialog
      ref={dialogo}
      className="painel-inferior dialogo-roteiro"
      aria-labelledby="titulo-painel"
      onCancel={(e) => { e.preventDefault(); aoFechar(); }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom) aoFechar();
      }}
    >
      <div className="secao-titulo">
        <h2 id="titulo-painel">Adicionar {destino.nome} a um roteiro</h2>
        <button type="button" className="fechar" aria-label="Fechar" onClick={aoFechar}>×</button>
      </div>
      <p className="legenda">Roteiros pessoais ficam salvos neste aparelho, sem cadastro.</p>
      {mensagem && <p className="legenda" role="status">{mensagem}</p>}
      {lista.map((v) => {
        const ja = v.destinos.includes(destino.id);
        return (
          <div key={v.id} className="item-painel">
            <div>
              <strong>{v.nome}</strong>
              <small>{ja ? 'Já inclui este destino' : `${v.destinos.length} ${v.destinos.length === 1 ? 'destino' : 'destinos'}`}</small>
            </div>
            {ja ? (
              <a ref={adicionadoEm === v.id ? abrirRoteiro : undefined} href={rota.viagem(v.id)} className="botao contorno curto">
                Abrir roteiro
              </a>
            ) : (
              <button type="button" className="botao secundario curto" aria-label={`Adicionar a ${v.nome}`} onClick={() => adicionar(v.id)}>
                Adicionar
              </button>
            )}
          </div>
        );
      })}
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          const v = viagens.criar(nome, destino.id);
          if (!viagens.obter(v.id)) {
            setMensagem('Não foi possível criar o roteiro neste aparelho. Tente novamente.');
            return;
          }
          medir('Roteiro criado', { origem: 'destino' });
          window.location.hash = rota.viagem(v.id);
        }}
      >
        <label htmlFor="nome-novo-roteiro">Nome do novo roteiro</label>
        <input id="nome-novo-roteiro" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
        <button type="submit" className="botao secundario">Criar roteiro</button>
        <p className="legenda">Pode salvar sem datas e montar o dia a dia depois.</p>
      </form>
    </dialog>
  );
}
