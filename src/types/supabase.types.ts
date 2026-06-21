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
          id?: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
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
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          project_json?: Json;
          is_public?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
          id?: string;
          project_id?: string;
          version_number?: number;
          project_json?: Json;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
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
          id?: string;
          project_id?: string;
          shared_with_user_id?: string;
          permission?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shared_projects_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_projects_shared_with_user_id_fkey";
            columns: ["shared_with_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
