// Escolhe o modo dos grupos: Supabase quando o .env tem as chaves; senão, demonstração.
import { useEffect, useState } from 'react';
import { config } from '../../config';
import { criarBackendDemo } from './demo';
import { criarBackendSupabase } from './supabase';
import type { BackendGrupos, Usuario } from './tipos';

export * from './tipos';

let instancia: BackendGrupos | null = null;

export function backend(): BackendGrupos {
  instancia ??= config.supabaseUrl && config.supabaseAnon ? criarBackendSupabase(config.supabaseUrl, config.supabaseAnon) : criarBackendDemo();
  return instancia;
}

/** Usuário logado (ou null) e se ainda está carregando. Atualiza quando o login muda. */
export function useUsuario(): { usuario: Usuario | null; carregando: boolean; recarregar: () => void } {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    let vivo = true;
    const ler = () =>
      backend()
        .usuario()
        .then((u) => vivo && (setUsuario(u), setCarregando(false)))
        .catch(() => vivo && setCarregando(false));
    ler();
    const parar = backend().aoMudarLogin(ler);
    return () => {
      vivo = false;
      parar();
    };
  }, [versao]);
  return { usuario, carregando, recarregar: () => setVersao((x) => x + 1) };
}
