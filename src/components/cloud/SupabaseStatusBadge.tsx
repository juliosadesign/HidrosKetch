import {
  getSupabaseSetupMessage,
  isSupabaseConfigured,
} from "../../lib/supabaseConfig";

export function SupabaseStatusBadge() {
  const statusMessage = getSupabaseSetupMessage();

  return (
    <div
      className={
        isSupabaseConfigured
          ? "hidden rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 lg:inline-flex"
          : "hidden rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 lg:inline-flex"
      }
      title={statusMessage}
      aria-label={statusMessage}
    >
      {isSupabaseConfigured ? "Nuvem pronta" : "Nuvem pendente"}
    </div>
  );
}
