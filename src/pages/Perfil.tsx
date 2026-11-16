import { useEffect, useState } from 'react';
import { CabecalhoVolta } from '../components/Nav';
import { Icone } from '../components/Icone';
import { perfil } from '../lib/storage';
import { rota } from '../lib/rota';

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
}

export function Perfil() {
  const [nome, setNome] = useState(perfil.nome());
  const [salvo, setSalvo] = useState(false);
  const [instalar, setInstalar] = useState<EventoInstalar | null>(null);

  useEffect(() => {
    const ao = (e: Event) => {
      e.preventDefault();
      setInstalar(e as EventoInstalar);
    };
    window.addEventListener('beforeinstallprompt', ao);
    return () => window.removeEventListener('beforeinstallprompt', ao);
  }, []);

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Perfil" />

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          perfil.salvarNome(nome);
          setSalvo(true);
        }}
      >
        <label>
          Seu nome
          <input value={nome} onChange={(e) => { setNome(e.target.value); setSalvo(false); }} placeholder="Como quer ser chamado" maxLength={40} />
        </label>
        <button className="botao secundario" type="submit">
          {salvo ? 'Salvo ✓' : 'Salvar'}
        </button>
      </form>

      {instalar && (
        <button className="botao" type="button" onClick={() => instalar.prompt().then(() => setInstalar(null))}>
          Instalar o Pico Trip no celular
        </button>
      )}
      <p className="aviso">
        Para instalar no iPhone: abra no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.
      </p>

      <div className="lista-simples">
        <a href={rota.roteiros}>Meu roteiro <Icone nome="seta" tamanho={16} /></a>
        <a href={rota.termos}>Termos de uso e privacidade <Icone nome="seta" tamanho={16} /></a>
        <a href={rota.creditos}>Créditos e fontes de dados <Icone nome="seta" tamanho={16} /></a>
      </div>

      <p className="legenda" style={{ textAlign: 'center' }}>Pico Trip · versão de teste 0.1</p>
    </main>
  );
}
