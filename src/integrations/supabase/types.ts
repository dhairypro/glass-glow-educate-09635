export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          class_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string | null
          date: string
          id: string
          marked_by: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          date: string
          id?: string
          marked_by: string
          status: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string | null
          id: string
          subject_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subject_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string | null
          id: string
          teacher_id: string | null
          title: string
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          id?: string
          teacher_id?: string | null
          title: string
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          id?: string
          teacher_id?: string | null
          title?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          class_id: string
          created_at: string | null
          created_by: string
          date: string
          id: string
          name: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by: string
          date: string
          id?: string
          name: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by?: string
          date?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          academic_year: string
          amount: number
          class_id: string
          created_at: string
          id: string
          payment_date: string
          payment_method: string
          recorded_by: string | null
          remarks: string | null
          student_id: string
          transaction_reference: string | null
        }
        Insert: {
          academic_year: string
          amount: number
          class_id: string
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string
          recorded_by?: string | null
          remarks?: string | null
          student_id: string
          transaction_reference?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          class_id?: string
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string
          recorded_by?: string | null
          remarks?: string | null
          student_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount: number
          class_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          amount: number
          class_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount?: number
          class_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string | null
          file_type: string
          file_url: string
          id: string
          parent_id: string
          parent_type: string
          title: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_type: string
          file_url: string
          id?: string
          parent_id: string
          parent_type: string
          title: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_type?: string
          file_url?: string
          id?: string
          parent_id?: string
          parent_type?: string
          title?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          profile_image: string | null
          roll_no: string | null
          user_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          profile_image?: string | null
          roll_no?: string | null
          user_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          profile_image?: string | null
          roll_no?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_marks: {
        Row: {
          created_at: string | null
          exam_id: string
          id: string
          marks_obtained: number
          max_marks: number
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          id?: string
          marks_obtained: number
          max_marks: number
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          id?: string
          marks_obtained?: number
          max_marks?: number
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_marks_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      student_fee_summary: {
        Row: {
          academic_year: string | null
          class_id: string | null
          class_name: string | null
          paid_amount: number | null
          pending_amount: number | null
          student_id: string | null
          student_name: string | null
          total_fees: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_student_fee_status: {
        Args: { _academic_year?: string; _student_id: string }
        Returns: {
          paid_amount: number
          payment_percentage: number
          pending_amount: number
          total_fees: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
