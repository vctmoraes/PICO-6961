import { useEffect, useState } from 'react';
import { CabecalhoVolta } from '../components/Nav';
import { Icone } from '../components/Icone';
import { backend, useUsuario, type Grupo, type Usuario } from '../lib/grupos';
import { perfil } from '../lib/storage';
import { rota } from '../lib/rota';
import { medir } from '../lib/medir';

/** Aviso do modo demonstração (sem Supabase configurado). */
export function AvisoDemo() {
  if (backend().modo !== 'demo') return null;
  return (
    <p className="aviso-demo" role="note">
      <strong>Modo demonstração.</strong> Os grupos e as mensagens ficam só neste aparelho. Os amigos não recebem nada até o app ligar o servidor.
    </p>
  );
}

/** Login por e-mail (link mágico, sem senha). */
export function Entrar({ aoEntrar }: { aoEntrar?: () => void }) {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'' | 'enviando' | 'enviado' | 'erro'>('');
  const [msg, setMsg] = useState('');
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setEstado('enviando');
        try {
          await backend().entrarComEmail(email.trim());
          setEstado('enviado');
          aoEntrar?.();
        } catch (err) {
          setEstado('erro');
          setMsg(err instanceof Error ? err.message : 'Não foi possível enviar o link.');
        }
      }}
    >
      <h2 className="titulo">Entre para usar os grupos</h2>
      <p className="legenda">Sem senha: você recebe um link de acesso no e-mail.</p>
      <label>
        Seu e-mail
        <input id="email-login" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" />
      </label>
      <button className="botao" type="submit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando…' : 'Receber o link de acesso'}
      </button>
      {estado === 'enviado' && backend().modo === 'supabase' && (
        <p className="legenda" role="status">
          Pronto. Abra o e-mail e toque no link para entrar. Confira também a caixa de spam.
        </p>
      )}
      {estado === 'erro' && (
        <p className="erro-form" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}

/** Primeiro acesso: nome, idade mínima e aceite dos termos. */
export function Cadastro({ aoTerminar }: { aoTerminar: () => void }) {
  const [nome, setNome] = useState(perfil.nome());
  const [idade, setIdade] = useState(false);
  const [erro, setErro] = useState('');
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!idade) return setErro('Para usar os grupos, você precisa ter 16 anos ou mais e aceitar os termos.');
        try {
          await backend().completarCadastro(nome, true);
          if (!perfil.nome()) perfil.salvarNome(nome);
          aoTerminar();
        } catch (err) {
          setErro(err instanceof Error ? err.message : 'Não foi possível salvar.');
        }
      }}
    >
      <h2 className="titulo">Complete o cadastro</h2>
      <label>
        Como os amigos veem você
        <input id="nome-cadastro" required maxLength={40} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome ou apelido" />
      </label>
      <label className="check">
        <input type="checkbox" checked={idade} onChange={(e) => setIdade(e.target.checked)} />
        <span>
          Tenho 16 anos ou mais e aceito os <a href={rota.termos}>termos de uso e as regras dos grupos</a>.
        </span>
      </label>
      {erro && (
        <p className="erro-form" role="alert">
          {erro}
        </p>
      )}
      <button className="botao" type="submit">
        Continuar
      </button>
    </form>
  );
}

/** Garante login e cadastro antes de mostrar o conteúdo. */
export function ComLogin({ children }: { children: (u: Usuario) => React.ReactNode }) {
  const { usuario, carregando, recarregar } = useUsuario();
  if (carregando) return <p className="legenda">Carregando…</p>;
  if (!usuario) return <Entrar aoEntrar={recarregar} />;
  if (!usuario.nome || !usuario.idadeOk) return <Cadastro aoTerminar={recarregar} />;
  return <>{children(usuario)}</>;
}

export function Grupos() {
  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Grupos" />
      <AvisoDemo />
      <ComLogin>{() => <ListaGrupos />}</ComLogin>
    </main>
  );
}

function ListaGrupos() {
  const [lista, setLista] = useState<Grupo[] | null>(null);
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    backend()
      .meusGrupos()
      .then(setLista)
      .catch((e) => setErro(e.message));
  }, []);

  return (
    <>
      <p className="legenda">Monte a viagem com os amigos: chat com cartões do app, roteiro do grupo e votação.</p>
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const g = await backend().criarGrupo(nome || 'Viagem de ski');
            medir('Grupo criado', { modo: backend().modo });
            window.location.hash = rota.grupo(g.id);
          } catch (err) {
            setErro(err instanceof Error ? err.message : 'Não foi possível criar o grupo.');
          }
        }}
      >
        <label htmlFor="nome-grupo">Criar grupo</label>
        <div className="linha-form">
          <input id="nome-grupo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Chile julho 2027" maxLength={60} />
          <button className="botao curto" type="submit">
            Criar
          </button>
        </div>
      </form>
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const g = await backend().entrarNoGrupo(codigo);
            medir('Entrou em grupo', { via: 'codigo' });
            window.location.hash = rota.grupo(g.id);
          } catch (err) {
            setErro(err instanceof Error ? err.message : 'Não foi possível entrar no grupo.');
          }
        }}
      >
        <label htmlFor="codigo-grupo">Entrar com código de convite</label>
        <div className="linha-form">
          <input id="codigo-grupo" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Ex.: 4F7A2C9B1E0D" maxLength={16} />
          <button className="botao secundario curto" type="submit" disabled={!codigo.trim()}>
            Entrar
          </button>
        </div>
      </form>
      {erro && (
        <p className="erro-form" role="alert">
          {erro}
        </p>
      )}

      <div className="secao-titulo">
        <h2>Meus grupos</h2>
      </div>
      {lista === null ? (
        <p className="legenda">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="legenda">Você ainda não está em nenhum grupo. Crie um grupo e mande o convite para os amigos.</p>
      ) : (
        lista.map((g) => (
          <a key={g.id} className="card cartao-viagem" href={rota.grupo(g.id)}>
            <div className="icone-viagem">
              <Icone nome="pessoas" tamanho={22} cor="#FFFFFF" />
            </div>
            <div className="info">
              <div className="nome">{g.nome}</div>
              <div className="sub">Convite: {g.codigo}</div>
            </div>
          </a>
        ))
      )}
    </>
  );
}
