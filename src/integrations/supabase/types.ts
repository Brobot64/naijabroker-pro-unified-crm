export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_officers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_officers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      add_ons: {
        Row: {
          category: string
          coverage_details: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_recommended: boolean | null
          name: string
          organization_id: string
          policy_types: string[] | null
          premium_impact_type: string | null
          premium_impact_value: number | null
          sum_insured_impact: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          coverage_details?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          name: string
          organization_id: string
          policy_types?: string[] | null
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          sum_insured_impact?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          coverage_details?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          name?: string
          organization_id?: string
          policy_types?: string[] | null
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          sum_insured_impact?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "fk_audit_logs_organization"
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
          {
            foreignKeyName: "fk_claims_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_claims_policy"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      clauses: {
        Row: {
          category: string
          clause_text: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_recommended: boolean | null
          name: string
          organization_id: string
          policy_types: string[] | null
          premium_impact_type: string | null
          premium_impact_value: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          clause_text: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          name: string
          organization_id: string
          policy_types?: string[] | null
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          clause_text?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          name?: string
          organization_id?: string
          policy_types?: string[] | null
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_classifications: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_classifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_industries: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_industries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_links: {
        Row: {
          client_id: string
          created_at: string
          evaluated_quotes_data: Json
          expires_at: string
          id: string
          is_used: boolean | null
          organization_id: string
          quote_id: string
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          evaluated_quotes_data: Json
          expires_at: string
          id?: string
          is_used?: boolean | null
          organization_id: string
          quote_id: string
          token: string
        }
        Update: {
          client_id?: string
          created_at?: string
          evaluated_quotes_data?: Json
          expires_at?: string
          id?: string
          is_used?: boolean | null
          organization_id?: string
          quote_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_portal_links_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_portal_links_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_portal_links_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_sessions: {
        Row: {
          client_id: string
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          organization_id: string
          quote_id: string
          session_token: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          organization_id: string
          quote_id: string
          session_token: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          organization_id?: string
          quote_id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_portal_sessions_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_portal_sessions_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_portal_sessions_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_officer: string | null
          address: string | null
          anniversary: string | null
          birthday: string | null
          chairman: string | null
          chairman_birthday: string | null
          chairman_email: string | null
          chairman_phone: string | null
          classification: string | null
          client_code: string
          client_type: string | null
          contact_address: string | null
          contact_anniversary: string | null
          contact_birthday: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          head_of_finance: string | null
          head_of_finance_birthday: string | null
          head_of_finance_email: string | null
          head_of_finance_phone: string | null
          id: string
          industry: string | null
          md: string | null
          md_birthday: string | null
          md_email: string | null
          md_phone: string | null
          name: string
          organization_id: string
          phone: string | null
          remark: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          account_officer?: string | null
          address?: string | null
          anniversary?: string | null
          birthday?: string | null
          chairman?: string | null
          chairman_birthday?: string | null
          chairman_email?: string | null
          chairman_phone?: string | null
          classification?: string | null
          client_code: string
          client_type?: string | null
          contact_address?: string | null
          contact_anniversary?: string | null
          contact_birthday?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          head_of_finance?: string | null
          head_of_finance_birthday?: string | null
          head_of_finance_email?: string | null
          head_of_finance_phone?: string | null
          id?: string
          industry?: string | null
          md?: string | null
          md_birthday?: string | null
          md_email?: string | null
          md_phone?: string | null
          name: string
          organization_id: string
          phone?: string | null
          remark?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          account_officer?: string | null
          address?: string | null
          anniversary?: string | null
          birthday?: string | null
          chairman?: string | null
          chairman_birthday?: string | null
          chairman_email?: string | null
          chairman_phone?: string | null
          classification?: string | null
          client_code?: string
          client_type?: string | null
          contact_address?: string | null
          contact_anniversary?: string | null
          contact_birthday?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          head_of_finance?: string | null
          head_of_finance_birthday?: string | null
          head_of_finance_email?: string | null
          head_of_finance_phone?: string | null
          id?: string
          industry?: string | null
          md?: string | null
          md_birthday?: string | null
          md_email?: string | null
          md_phone?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          remark?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clients_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          {
            foreignKeyName: "fk_discharge_vouchers_claim"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_discharge_vouchers_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_discharge_vouchers_settlement"
            columns: ["settlement_voucher_id"]
            isOneToOne: false
            referencedRelation: "settlement_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          organization_id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          organization_id: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_email_notifications_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluated_quotes: {
        Row: {
          ai_analysis: Json | null
          commission_split: number
          coverage_limits: Json | null
          created_at: string
          dispatched_at: string | null
          document_url: string | null
          evaluated_at: string | null
          evaluation_source: string | null
          exclusions: string[] | null
          id: string
          insurer_email: string | null
          insurer_id: string | null
          insurer_name: string
          organization_id: string
          premium_quoted: number
          quote_id: string
          rating_score: number | null
          remarks: string | null
          response_received: boolean | null
          source: string
          status: string
          terms_conditions: string | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          commission_split?: number
          coverage_limits?: Json | null
          created_at?: string
          dispatched_at?: string | null
          document_url?: string | null
          evaluated_at?: string | null
          evaluation_source?: string | null
          exclusions?: string[] | null
          id?: string
          insurer_email?: string | null
          insurer_id?: string | null
          insurer_name: string
          organization_id: string
          premium_quoted?: number
          quote_id: string
          rating_score?: number | null
          remarks?: string | null
          response_received?: boolean | null
          source?: string
          status?: string
          terms_conditions?: string | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          commission_split?: number
          coverage_limits?: Json | null
          created_at?: string
          dispatched_at?: string | null
          document_url?: string | null
          evaluated_at?: string | null
          evaluation_source?: string | null
          exclusions?: string[] | null
          id?: string
          insurer_email?: string | null
          insurer_id?: string | null
          insurer_name?: string
          organization_id?: string
          premium_quoted?: number
          quote_id?: string
          rating_score?: number | null
          remarks?: string | null
          response_received?: boolean | null
          source?: string
          status?: string
          terms_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_evaluated_quotes_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_evaluated_quotes_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
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
          {
            foreignKeyName: "fk_financial_transactions_claim"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financial_transactions_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financial_transactions_policy"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      insurer_responses: {
        Row: {
          coverage_limits: Json | null
          created_at: string | null
          document_url: string | null
          exclusions: string[] | null
          id: string
          insurer_name: string
          is_selected: boolean | null
          organization_id: string
          premium_quoted: number
          quote_id: string
          rating_score: number | null
          remarks: string | null
          response_date: string | null
          terms_conditions: string | null
        }
        Insert: {
          coverage_limits?: Json | null
          created_at?: string | null
          document_url?: string | null
          exclusions?: string[] | null
          id?: string
          insurer_name: string
          is_selected?: boolean | null
          organization_id: string
          premium_quoted?: number
          quote_id: string
          rating_score?: number | null
          remarks?: string | null
          response_date?: string | null
          terms_conditions?: string | null
        }
        Update: {
          coverage_limits?: Json | null
          created_at?: string | null
          document_url?: string | null
          exclusions?: string[] | null
          id?: string
          insurer_name?: string
          is_selected?: boolean | null
          organization_id?: string
          premium_quoted?: number
          quote_id?: string
          rating_score?: number | null
          remarks?: string | null
          response_date?: string | null
          terms_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_insurer_responses_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_insurer_responses_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      insurers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          performance_score: number | null
          phone: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          performance_score?: number | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          performance_score?: number | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_insurers_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            foreignKeyName: "fk_notifications_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          bank_details: Json | null
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
          bank_details?: Json | null
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
          bank_details?: Json | null
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
      payment_transactions: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          organization_id: string
          paid_at: string | null
          payment_method: string
          payment_provider: string | null
          provider_reference: string | null
          quote_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          organization_id: string
          paid_at?: string | null
          payment_method: string
          payment_provider?: string | null
          provider_reference?: string | null
          quote_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          paid_at?: string | null
          payment_method?: string
          payment_provider?: string | null
          provider_reference?: string | null
          quote_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_transactions_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_transactions_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_transactions_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fk_policies_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
      quote_add_ons: {
        Row: {
          add_on_id: string | null
          created_at: string | null
          custom_coverage_details: string | null
          custom_description: string | null
          custom_name: string | null
          id: string
          is_custom: boolean | null
          organization_id: string
          premium_impact_type: string | null
          premium_impact_value: number | null
          quote_id: string
          sum_insured_impact: number | null
        }
        Insert: {
          add_on_id?: string | null
          created_at?: string | null
          custom_coverage_details?: string | null
          custom_description?: string | null
          custom_name?: string | null
          id?: string
          is_custom?: boolean | null
          organization_id: string
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          quote_id: string
          sum_insured_impact?: number | null
        }
        Update: {
          add_on_id?: string | null
          created_at?: string | null
          custom_coverage_details?: string | null
          custom_description?: string | null
          custom_name?: string | null
          id?: string
          is_custom?: boolean | null
          organization_id?: string
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          quote_id?: string
          sum_insured_impact?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_add_ons_add_on"
            columns: ["add_on_id"]
            isOneToOne: false
            referencedRelation: "add_ons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quote_add_ons_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_audit_trail: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          organization_id: string
          quote_id: string
          stage: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id: string
          quote_id: string
          stage: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string
          quote_id?: string
          stage?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_audit_trail_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quote_audit_trail_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_clauses: {
        Row: {
          category: string
          clause_id: string | null
          created_at: string | null
          custom_clause_text: string | null
          custom_description: string | null
          custom_name: string | null
          id: string
          is_custom: boolean | null
          organization_id: string
          premium_impact_type: string | null
          premium_impact_value: number | null
          quote_id: string
        }
        Insert: {
          category: string
          clause_id?: string | null
          created_at?: string | null
          custom_clause_text?: string | null
          custom_description?: string | null
          custom_name?: string | null
          id?: string
          is_custom?: boolean | null
          organization_id: string
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          quote_id: string
        }
        Update: {
          category?: string
          clause_id?: string | null
          created_at?: string | null
          custom_clause_text?: string | null
          custom_description?: string | null
          custom_name?: string | null
          id?: string
          is_custom?: boolean | null
          organization_id?: string
          premium_impact_type?: string | null
          premium_impact_value?: number | null
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_clauses_clause"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "clauses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quote_clauses_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_name: string
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          is_locked: boolean | null
          mime_type: string | null
          organization_id: string
          quote_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_name: string
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          is_locked?: boolean | null
          mime_type?: string | null
          organization_id: string
          quote_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_name?: string
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          is_locked?: boolean | null
          mime_type?: string | null
          organization_id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_documents_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quote_documents_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          calculations: Json | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          commission_rate: number
          commission_splits: Json | null
          converted_to_policy: string | null
          coverage_requirements: string | null
          created_at: string | null
          created_by: string | null
          final_contract_url: string | null
          id: string
          insured_description: string | null
          insured_item: string | null
          insurer_splits: Json | null
          interim_contract_url: string | null
          location: string | null
          notes: string | null
          organization_id: string
          payment_reference: string | null
          payment_status: string | null
          policy_type: string
          premium: number
          quote_number: string
          rfq_document_url: string | null
          risk_details: string | null
          status: Database["public"]["Enums"]["quote_status"]
          sum_insured: number
          terms_conditions: string | null
          underwriter: string
          updated_at: string | null
          valid_until: string
          workflow_stage: string | null
        }
        Insert: {
          calculations?: Json | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          commission_rate?: number
          commission_splits?: Json | null
          converted_to_policy?: string | null
          coverage_requirements?: string | null
          created_at?: string | null
          created_by?: string | null
          final_contract_url?: string | null
          id?: string
          insured_description?: string | null
          insured_item?: string | null
          insurer_splits?: Json | null
          interim_contract_url?: string | null
          location?: string | null
          notes?: string | null
          organization_id: string
          payment_reference?: string | null
          payment_status?: string | null
          policy_type: string
          premium?: number
          quote_number: string
          rfq_document_url?: string | null
          risk_details?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          sum_insured?: number
          terms_conditions?: string | null
          underwriter: string
          updated_at?: string | null
          valid_until: string
          workflow_stage?: string | null
        }
        Update: {
          calculations?: Json | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          commission_rate?: number
          commission_splits?: Json | null
          converted_to_policy?: string | null
          coverage_requirements?: string | null
          created_at?: string | null
          created_by?: string | null
          final_contract_url?: string | null
          id?: string
          insured_description?: string | null
          insured_item?: string | null
          insurer_splits?: Json | null
          interim_contract_url?: string | null
          location?: string | null
          notes?: string | null
          organization_id?: string
          payment_reference?: string | null
          payment_status?: string | null
          policy_type?: string
          premium?: number
          quote_number?: string
          rfq_document_url?: string | null
          risk_details?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          sum_insured?: number
          terms_conditions?: string | null
          underwriter?: string
          updated_at?: string | null
          valid_until?: string
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quotes_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quotes_converted_policy"
            columns: ["converted_to_policy"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quotes_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "fk_settlement_vouchers_claim"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_settlement_vouchers_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "fk_workflow_steps_workflow"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "fk_workflows_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
      generate_client_code: {
        Args: { org_id: string } | { org_id: string; client_type?: string }
        Returns: string
      }
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
