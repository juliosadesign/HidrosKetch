import { useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabaseClient";
import { getSupabaseSetupMessage } from "../../lib/supabaseConfig";
import { upsertAuthProfile } from "../../lib/authProfile";

type AuthMode = "login" | "signup";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: User) => void;
};

function getAuthErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
  }

  if (normalizedMessage.includes("password")) {
    return "A senha precisa atender aos requisitos mínimos do Supabase.";
  }

  if (normalizedMessage.includes("email")) {
    return "Confira o endereço de e-mail informado.";
  }

  return errorMessage;
}

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isSignup = mode === "signup";

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setFeedback(null);
    setFeedbackType("success");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setFeedbackType("error");
      setFeedback(getSupabaseSetupMessage());
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setFeedbackType("error");
      setFeedback("Informe e-mail e senha para continuar.");
      return;
    }

    if (isSignup && password.length < 6) {
      setFeedbackType("error");
      setFeedback("Use uma senha com pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName || cleanEmail,
            },
          },
        });

        if (error) throw error;

        if (data.user && data.session) {
          await upsertAuthProfile(data.user, cleanName);
          onAuthenticated(data.user);
          onClose();
          return;
        }

        setFeedbackType("success");
        setFeedback(
          "Conta criada. Se a confirmação de e-mail estiver ativa, confirme o e-mail antes de entrar."
        );
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await upsertAuthProfile(data.user);
        onAuthenticated(data.user);
        onClose();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? getAuthErrorMessage(error.message)
          : "Não foi possível autenticar agora.";

      setFeedbackType("error");
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-cyan-950/40">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Conta HidroSketch
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">
              {isSignup ? "Criar conta" : "Entrar na nuvem"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Use sua conta para preparar o salvamento de projetos na nuvem.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-2 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            aria-label="Fechar autenticação"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 px-5 pt-5">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={
              mode === "login"
                ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100"
                : "rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500"
            }
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("signup")}
            className={
              mode === "signup"
                ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100"
                : "rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500"
            }
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {isSignup && (
            <label className="block text-sm font-medium text-slate-200">
              Nome
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                placeholder="Seu nome"
                autoComplete="name"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-slate-200">
            E-mail
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
              placeholder="seuemail@exemplo.com"
              type="email"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Senha
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
              placeholder="Mínimo de 6 caracteres"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>

          {feedback && (
            <div
              className={
                feedbackType === "success"
                  ? "rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
                  : "rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
              }
            >
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Processando..."
              : isSignup
                ? "Criar conta"
                : "Entrar"}
          </button>

          <p className="text-xs leading-relaxed text-slate-500">
            A senha é gerenciada pelo Supabase Auth. O HidroSketch não salva sua senha manualmente no banco.
          </p>
        </form>
      </div>
    </div>
  );
}
