import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getUserDisplayName, upsertAuthProfile } from "../../lib/authProfile";
import { supabase } from "../../lib/supabaseClient";
import { getSupabaseSetupMessage } from "../../lib/supabaseConfig";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(supabase));
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!isMounted) return;

        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          await upsertAuthProfile(sessionUser);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          upsertAuthProfile(sessionUser).catch(() => {
            setAuthMessage(
              "Login ativo, mas não foi possível atualizar o perfil agora."
            );
          });
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) return;

    setAuthMessage(null);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthMessage("Não foi possível sair agora. Tente novamente.");
      return;
    }

    setUser(null);
  }

  if (!supabase) {
    return (
      <button
        type="button"
        className="hidden rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 lg:inline-flex"
        title={getSupabaseSetupMessage()}
        onClick={() => setAuthMessage(getSupabaseSetupMessage())}
      >
        Login indisponível
      </button>
    );
  }

  if (isLoading) {
    return (
      <span className="hidden rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 lg:inline-flex">
        Verificando conta...
      </span>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {user ? (
        <>
          <div className="hidden max-w-[210px] rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 xl:block">
            <span className="block truncate font-semibold">
              {getUserDisplayName(user)}
            </span>
            <span className="block truncate text-emerald-200/70">
              Conta conectada
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-100"
          >
            Sair
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAuthMessage(null);
            setIsAuthOpen(true);
          }}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
        >
          Entrar
        </button>
      )}

      {authMessage && (
        <div className="absolute right-0 top-10 z-40 w-72 rounded-xl border border-amber-400/40 bg-slate-950 p-3 text-xs text-amber-100 shadow-xl">
          <p>{authMessage}</p>
          <button
            type="button"
            onClick={() => setAuthMessage(null)}
            className="mt-2 font-semibold text-amber-200 underline"
          >
            Fechar
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthMessage("Login realizado com sucesso.");
        }}
      />
    </div>
  );
}
