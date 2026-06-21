import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabaseClient";

type UserMetadata = {
  name?: unknown;
  avatar_url?: unknown;
};

function readTextMetadata(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function getUserDisplayName(user: User | null) {
  if (!user) return "Usuário";

  const metadata = user.user_metadata as UserMetadata;
  const metadataName = readTextMetadata(metadata.name);

  if (metadataName) return metadataName;
  if (user.email) return user.email;

  return "Usuário logado";
}

export async function upsertAuthProfile(user: User, typedName?: string) {
  if (!supabase) return { ok: false, message: "Supabase não configurado." };

  const metadata = user.user_metadata as UserMetadata;
  const name =
    readTextMetadata(typedName) ??
    readTextMetadata(metadata.name) ??
    user.email ??
    "Usuário HidroSketch";

  const avatarUrl = readTextMetadata(metadata.avatar_url);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      name,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return {
      ok: false,
      message:
        "Login realizado, mas não foi possível atualizar o perfil agora.",
    };
  }

  return { ok: true, message: "Perfil atualizado." };
}
