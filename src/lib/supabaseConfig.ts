const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

function looksLikeSupabaseUrl(value: string) {
  if (!value) return false;

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
  hasUrl: supabaseUrl.length > 0,
  hasPublishableKey: supabasePublishableKey.length > 0,
  hasValidUrl: looksLikeSupabaseUrl(supabaseUrl),
};

export const isSupabaseConfigured =
  supabaseConfig.hasValidUrl && supabaseConfig.hasPublishableKey;

export function getSupabaseSetupMessage() {
  if (isSupabaseConfigured) {
    return "Supabase configurado. A próxima sprint pode adicionar login e projetos na nuvem.";
  }

  if (!supabaseConfig.hasUrl && !supabaseConfig.hasPublishableKey) {
    return "Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local e na Vercel.";
  }

  if (!supabaseConfig.hasValidUrl) {
    return "Verifique se VITE_SUPABASE_URL usa o endereço real do projeto Supabase, terminando em .supabase.co.";
  }

  return "Configure VITE_SUPABASE_PUBLISHABLE_KEY com a chave publicável do Supabase.";
}
