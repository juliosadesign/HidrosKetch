import { supabase } from "./supabaseClient";
import type { Json } from "../types/supabase.types";

export type SaveCloudProjectInput = {
  userId: string;
  projectId: string | null;
  name: string;
  description?: string | null;
  projectJson: Json;
  versionNumber: number;
};

export type SaveCloudProjectResult = {
  ok: boolean;
  projectId: string | null;
  versionNumber: number;
  message: string;
};

export async function saveProjectToCloud(
  input: SaveCloudProjectInput
): Promise<SaveCloudProjectResult> {
  if (!supabase) {
    return {
      ok: false,
      projectId: null,
      versionNumber: input.versionNumber,
      message: "Supabase não está configurado neste ambiente.",
    };
  }

  const now = new Date().toISOString();
  const nextVersionNumber = Math.max(1, input.versionNumber);

  let savedProjectId = input.projectId;

  if (savedProjectId) {
    const { data, error } = await supabase
      .from("projects")
      .update({
        name: input.name,
        description: input.description ?? null,
        project_json: input.projectJson,
        is_public: false,
        updated_at: now,
      })
      .eq("id", savedProjectId)
      .select("id")
      .single();

    if (error || !data) {
      return {
        ok: false,
        projectId: savedProjectId,
        versionNumber: input.versionNumber,
        message: `Não foi possível atualizar o projeto na nuvem: ${
          error?.message ?? "resposta vazia do Supabase"
        }`,
      };
    }

    savedProjectId = data.id;
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: input.userId,
        name: input.name,
        description: input.description ?? null,
        project_json: input.projectJson,
        is_public: false,
        updated_at: now,
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        ok: false,
        projectId: null,
        versionNumber: input.versionNumber,
        message: `Não foi possível criar o projeto na nuvem: ${
          error?.message ?? "resposta vazia do Supabase"
        }`,
      };
    }

    savedProjectId = data.id;
  }

  const { error: versionError } = await supabase
    .from("project_versions")
    .insert({
      project_id: savedProjectId,
      version_number: nextVersionNumber,
      project_json: input.projectJson,
      created_at: now,
    });

  if (versionError) {
    return {
      ok: true,
      projectId: savedProjectId,
      versionNumber: input.versionNumber,
      message:
        "Projeto salvo na nuvem, mas o histórico de versão não foi criado agora.",
    };
  }

  return {
    ok: true,
    projectId: savedProjectId,
    versionNumber: nextVersionNumber,
    message: "Projeto salvo na nuvem.",
  };
}
