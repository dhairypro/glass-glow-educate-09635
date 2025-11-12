export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          id: string
          class_id: string
          student_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          marked_by: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          student_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          marked_by: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          student_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late'
          marked_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chapters: {
        Row: {
          id: string
          subject_id: string
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          title: string
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          title?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      classes: {
        Row: {
          id: string
          title: string
          academic_year: string
          teacher_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          academic_year: string
          teacher_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          academic_year?: string
          teacher_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      exams: {
        Row: {
          id: string
          class_id: string
          name: string
          date: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          date: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          date?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          id: string
          parent_type: string
          parent_id: string
          title: string
          file_url: string
          file_type: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_type: string
          parent_id: string
          title: string
          file_url: string
          file_type: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_type?: string
          parent_id?: string
          title?: string
          file_url?: string
          file_type?: string
          uploaded_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          roll_no: string | null
          class_id: string | null
          profile_image: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          roll_no?: string | null
          class_id?: string | null
          profile_image?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          roll_no?: string | null
          class_id?: string | null
          profile_image?: string | null
          email?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      student_marks: {
        Row: {
          id: string
          student_id: string
          exam_id: string
          subject_id: string
          marks_obtained: number
          max_marks: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_id: string
          subject_id: string
          marks_obtained: number
          max_marks: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_id?: string
          subject_id?: string
          marks_obtained?: number
          max_marks?: number
          created_at?: string
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
            foreignKeyName: "student_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      subjects: {
        Row: {
          id: string
          class_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database['public']['Enums']['app_role']
        }
        Insert: {
          id?: string
          user_id: string
          role: Database['public']['Enums']['app_role']
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database['public']['Enums']['app_role']
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database['public']['Enums']['app_role']
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'admin' | 'teacher' | 'student'
    }
  }
}
