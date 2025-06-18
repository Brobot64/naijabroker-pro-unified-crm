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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          assigned_adjuster: string | null
          claim_number: string
          claim_type: string
          client_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          documents_complete: boolean | null
          estimated_loss: number
          id: string
          incident_date: string
          investigation_complete: boolean | null
          notes: string | null
          organization_id: string
          policy_id: string
          policy_number: string
          reported_date: string
          settlement_amount: number | null
          status: Database["public"]["Enums"]["claim_status"]
          underwriter_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          assigned_adjuster?: string | null
          claim_number: string
          claim_type: string
          client_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          documents_complete?: boolean | null
          estimated_loss?: number
          id?: string
          incident_date: string
          investigation_complete?: boolean | null
          notes?: string | null
          organization_id: string
          policy_id: string
          policy_number: string
          reported_date?: string
          settlement_amount?: number | null
          status?: Database["public"]["Enums"]["claim_status"]
          underwriter_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assigned_adjuster?: string | null
          claim_number?: string
          claim_type?: string
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          documents_complete?: boolean | null
          estimated_loss?: number
          id?: string
          incident_date?: string
          investigation_complete?: boolean | null
          notes?: string | null
          organization_id?: string
          policy_id?: string
          policy_number?: string
          reported_date?: string
          settlement_amount?: number | null
          status?: Database["public"]["Enums"]["claim_status"]
          underwriter_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      discharge_vouchers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          claim_id: string
          created_at: string | null
          created_by: string | null
          discharge_date: string
          id: string
          notes: string | null
          organization_id: string
          settlement_voucher_id: string
          underwriter: string
          voucher_amount: number
          voucher_number: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          claim_id: string
          created_at?: string | null
          created_by?: string | null
          discharge_date: string
          id?: string
          notes?: string | null
          organization_id: string
          settlement_voucher_id: string
          underwriter: string
          voucher_amount: number
          voucher_number: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          claim_id?: string
          created_at?: string | null
          created_by?: string | null
          discharge_date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          settlement_voucher_id?: string
          underwriter?: string
          voucher_amount?: number
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "discharge_vouchers_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discharge_vouchers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discharge_vouchers_settlement_voucher_id_fkey"
            columns: ["settlement_voucher_id"]
            isOneToOne: false
            referencedRelation: "settlement_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_name: string | null
          cheque_date: string | null
          cheque_number: string | null
          claim_id: string | null
          client_name: string
          created_at: string | null
          created_by: string | null
          due_date: string | null
          gross_amount: number
          id: string
          metadata: Json | null
          net_amount: number
          notes: string | null
          organization_id: string
          outstanding_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          policy_id: string | null
          status: string
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_name?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          claim_id?: string | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          gross_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          notes?: string | null
          organization_id: string
          outstanding_amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          policy_id?: string | null
          status?: string
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          vat_amount?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_name?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          claim_id?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          gross_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          notes?: string | null
          organization_id?: string
          outstanding_amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          policy_id?: string | null
          status?: string
          transaction_number?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          organization_id: string
          priority: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          organization_id: string
          priority?: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string
          priority?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          business_hours: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          industry: string | null
          logo_url: string | null
          mfa_required: boolean | null
          name: string
          password_policy: string | null
          phone: string | null
          plan: string
          primary_color: string | null
          secondary_color: string | null
          size: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mfa_required?: boolean | null
          name: string
          password_policy?: string | null
          phone?: string | null
          plan: string
          primary_color?: string | null
          secondary_color?: string | null
          size?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mfa_required?: boolean | null
          name?: string
          password_policy?: string | null
          phone?: string | null
          plan?: string
          primary_color?: string | null
          secondary_color?: string | null
          size?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          co_insurers: Json | null
          commission_amount: number
          commission_rate: number
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          organization_id: string
          policy_number: string
          policy_type: string
          premium: number
          start_date: string
          status: Database["public"]["Enums"]["policy_status"]
          sum_insured: number
          terms_conditions: string | null
          underwriter: string
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          co_insurers?: Json | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          organization_id: string
          policy_number: string
          policy_type: string
          premium?: number
          start_date: string
          status?: Database["public"]["Enums"]["policy_status"]
          sum_insured?: number
          terms_conditions?: string | null
          underwriter: string
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          co_insurers?: Json | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          policy_number?: string
          policy_type?: string
          premium?: number
          start_date?: string
          status?: Database["public"]["Enums"]["policy_status"]
          sum_insured?: number
          terms_conditions?: string | null
          underwriter?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          commission_rate: number
          converted_to_policy: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          policy_type: string
          premium: number
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          sum_insured: number
          terms_conditions: string | null
          underwriter: string
          updated_at: string | null
          valid_until: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          commission_rate?: number
          converted_to_policy?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          policy_type: string
          premium?: number
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"]
          sum_insured?: number
          terms_conditions?: string | null
          underwriter: string
          updated_at?: string | null
          valid_until: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          commission_rate?: number
          converted_to_policy?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          policy_type?: string
          premium?: number
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          sum_insured?: number
          terms_conditions?: string | null
          underwriter?: string
          updated_at?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_converted_to_policy_fkey"
            columns: ["converted_to_policy"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_vouchers: {
        Row: {
          agreed_amount: number
          bank_name: string | null
          cheque_date: string
          cheque_number: string
          claim_id: string
          client_name: string
          created_at: string | null
          created_by: string | null
          discharging_officer: string | null
          id: string
          is_processed: boolean | null
          organization_id: string
          policy_number: string
          remarks: string | null
          settlement_type: Database["public"]["Enums"]["settlement_type"]
          voucher_number: string
        }
        Insert: {
          agreed_amount: number
          bank_name?: string | null
          cheque_date: string
          cheque_number: string
          claim_id: string
          client_name: string
          created_at?: string | null
          created_by?: string | null
          discharging_officer?: string | null
          id?: string
          is_processed?: boolean | null
          organization_id: string
          policy_number: string
          remarks?: string | null
          settlement_type?: Database["public"]["Enums"]["settlement_type"]
          voucher_number: string
        }
        Update: {
          agreed_amount?: number
          bank_name?: string | null
          cheque_date?: string
          cheque_number?: string
          claim_id?: string
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          discharging_officer?: string | null
          id?: string
          is_processed?: boolean | null
          organization_id?: string
          policy_number?: string
          remarks?: string | null
          settlement_type?: Database["public"]["Enums"]["settlement_type"]
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_vouchers_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_vouchers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          first_name: string | null
          id: string
          invited_by: string | null
          last_name: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          first_name?: string | null
          id?: string
          invited_by?: string | null
          last_name?: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          first_name?: string | null
          id?: string
          invited_by?: string | null
          last_name?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          comments: string | null
          created_at: string | null
          id: string
          role_required: string
          status: Database["public"]["Enums"]["approval_status"]
          step_name: string
          step_number: number
          workflow_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          role_required: string
          status?: Database["public"]["Enums"]["approval_status"]
          step_name: string
          step_number: number
          workflow_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          role_required?: string
          status?: Database["public"]["Enums"]["approval_status"]
          step_name?: string
          step_number?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          amount: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_step: number
          id: string
          metadata: Json | null
          organization_id: string
          reference_id: string
          reference_type: string
          status: Database["public"]["Enums"]["approval_status"]
          total_steps: number
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          amount?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number
          id?: string
          metadata?: Json | null
          organization_id: string
          reference_id: string
          reference_type: string
          status?: Database["public"]["Enums"]["approval_status"]
          total_steps?: number
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          amount?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number
          id?: string
          metadata?: Json | null
          organization_id?: string
          reference_id?: string
          reference_type?: string
          status?: Database["public"]["Enums"]["approval_status"]
          total_steps?: number
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_organization_id: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      test_organization_insert: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "SuperAdmin"
        | "BrokerAdmin"
        | "Agent"
        | "Underwriter"
        | "Compliance"
        | "User"
      approval_status: "pending" | "approved" | "rejected"
      claim_status:
        | "registered"
        | "investigating"
        | "assessed"
        | "approved"
        | "settled"
        | "rejected"
        | "closed"
      payment_method: "bank_transfer" | "cheque" | "cash" | "online" | "card"
      policy_status: "draft" | "active" | "expired" | "cancelled" | "renewed"
      quote_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      settlement_type: "full" | "partial" | "final"
      transaction_type:
        | "debit_note"
        | "credit_note"
        | "receipt"
        | "remittance"
        | "commission"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "SuperAdmin",
        "BrokerAdmin",
        "Agent",
        "Underwriter",
        "Compliance",
        "User",
      ],
      approval_status: ["pending", "approved", "rejected"],
      claim_status: [
        "registered",
        "investigating",
        "assessed",
        "approved",
        "settled",
        "rejected",
        "closed",
      ],
      payment_method: ["bank_transfer", "cheque", "cash", "online", "card"],
      policy_status: ["draft", "active", "expired", "cancelled", "renewed"],
      quote_status: ["draft", "sent", "accepted", "rejected", "expired"],
      settlement_type: ["full", "partial", "final"],
      transaction_type: [
        "debit_note",
        "credit_note",
        "receipt",
        "remittance",
        "commission",
      ],
    },
  },
} as const
