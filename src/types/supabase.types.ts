export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          project_json: Json;
          is_public: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          description?: string | null;
          project_json: Json;
          is_public?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          project_json?: Json;
          is_public?: boolean;
          updated_at?: string | null;
        };
      };
      project_versions: {
        Row: {
          id: string;
          project_id: string;
          version_number: number;
          project_json: Json;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_number: number;
          project_json: Json;
          created_at?: string | null;
        };
        Update: {
          version_number?: number;
          project_json?: Json;
        };
      };
      shared_projects: {
        Row: {
          id: string;
          project_id: string;
          shared_with_user_id: string;
          permission: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          shared_with_user_id: string;
          permission?: string;
          created_at?: string | null;
        };
        Update: {
          permission?: string;
        };
      };
    };
  };
};
