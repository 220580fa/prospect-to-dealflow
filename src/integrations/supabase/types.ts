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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          actor_id: string | null
          channel: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          description: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          occurred_at: string
          result: string | null
          title: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          channel?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          occurred_at?: string
          result?: string | null
          title: string
          type: string
        }
        Update: {
          actor_id?: string | null
          channel?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          occurred_at?: string
          result?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_config: Json | null
          action_type: string
          active: boolean
          condition: Json | null
          created_at: string
          id: string
          name: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          active?: boolean
          condition?: Json | null
          created_at?: string
          id?: string
          name: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          active?: boolean
          condition?: Json | null
          created_at?: string
          id?: string
          name?: string
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string | null
          cnpj: string | null
          created_at: string
          created_by: string | null
          employees: number | null
          id: string
          legal_name: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          segment: string | null
          state: string | null
          trade_name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          employees?: number | null
          id?: string
          legal_name?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          segment?: string | null
          state?: string | null
          trade_name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          employees?: number | null
          id?: string
          legal_name?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          segment?: string | null
          state?: string | null
          trade_name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          is_decision_maker: boolean
          is_influencer: boolean
          is_user: boolean
          job_title: string | null
          last_name: string | null
          linkedin: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_decision_maker?: boolean
          is_influencer?: boolean
          is_user?: boolean
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_decision_maker?: boolean
          is_influencer?: boolean
          is_user?: boolean
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_products: {
        Row: {
          deal_id: string
          id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          deal_id: string
          id?: string
          product_id: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          deal_id?: string
          id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          expected_close_date: string | null
          funnel_id: string | null
          id: string
          lead_id: string | null
          loss_notes: string | null
          loss_reason_id: string | null
          lost_at: string | null
          owner_id: string | null
          probability: number
          source: string | null
          stage_entered_at: string
          stage_id: string | null
          status: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at: string
          value: number
          won_at: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          expected_close_date?: string | null
          funnel_id?: string | null
          id?: string
          lead_id?: string | null
          loss_notes?: string | null
          loss_reason_id?: string | null
          lost_at?: string | null
          owner_id?: string | null
          probability?: number
          source?: string | null
          stage_entered_at?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at?: string
          value?: number
          won_at?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          expected_close_date?: string | null
          funnel_id?: string | null
          id?: string
          lead_id?: string | null
          loss_notes?: string | null
          loss_reason_id?: string | null
          lost_at?: string | null
          owner_id?: string | null
          probability?: number
          source?: string | null
          stage_entered_at?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title?: string
          updated_at?: string
          value?: number
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          archived: boolean
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["funnel_kind"]
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["funnel_kind"]
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["funnel_kind"]
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          id: string
          metric: string
          owner_id: string | null
          period_end: string
          period_start: string
          period_type: string
          target: number
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric: string
          owner_id?: string | null
          period_end: string
          period_start: string
          period_type?: string
          target?: number
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric?: string
          owner_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          target?: number
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          lead_id: string
          tag_id: string
        }
        Insert: {
          lead_id: string
          tag_id: string
        }
        Update: {
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          campaign: string | null
          city: string | null
          cnpj: string | null
          company_id: string | null
          company_name: string | null
          competitor: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          employees: number | null
          expected_close_date: string | null
          first_name: string
          funnel_id: string | null
          id: string
          job_title: string | null
          last_interaction_at: string | null
          last_name: string | null
          lead_score: number
          linkedin: string | null
          loss_notes: string | null
          loss_reason_id: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          potential_value: number | null
          probability: number | null
          product_interest: string | null
          segment: string | null
          source: string | null
          stage_entered_at: string
          stage_id: string | null
          state: string | null
          status: string
          temperature: Database["public"]["Enums"]["temperature"]
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          campaign?: string | null
          city?: string | null
          cnpj?: string | null
          company_id?: string | null
          company_name?: string | null
          competitor?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          employees?: number | null
          expected_close_date?: string | null
          first_name: string
          funnel_id?: string | null
          id?: string
          job_title?: string | null
          last_interaction_at?: string | null
          last_name?: string | null
          lead_score?: number
          linkedin?: string | null
          loss_notes?: string | null
          loss_reason_id?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          potential_value?: number | null
          probability?: number | null
          product_interest?: string | null
          segment?: string | null
          source?: string | null
          stage_entered_at?: string
          stage_id?: string | null
          state?: string | null
          status?: string
          temperature?: Database["public"]["Enums"]["temperature"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          campaign?: string | null
          city?: string | null
          cnpj?: string | null
          company_id?: string | null
          company_name?: string | null
          competitor?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          employees?: number | null
          expected_close_date?: string | null
          first_name?: string
          funnel_id?: string | null
          id?: string
          job_title?: string | null
          last_interaction_at?: string | null
          last_name?: string | null
          lead_score?: number
          linkedin?: string | null
          loss_notes?: string | null
          loss_reason_id?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          potential_value?: number | null
          probability?: number | null
          product_interest?: string | null
          segment?: string | null
          source?: string | null
          stage_entered_at?: string
          stage_id?: string | null
          state?: string | null
          status?: string
          temperature?: Database["public"]["Enums"]["temperature"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      loss_reasons: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      meeting_qualifications: {
        Row: {
          budget_status: string | null
          competitors: string | null
          competitors_present: string | null
          created_at: string
          created_by: string | null
          current_situation: string | null
          deal_id: string | null
          decision_makers: Json | null
          discussed_points: string | null
          expected_close_date: string | null
          id: string
          impact_notes: string | null
          impacts: string[] | null
          interest_level: string | null
          interest_products: string[] | null
          is_decision_maker: string | null
          lead_id: string | null
          meeting_id: string
          need_level: string | null
          need_notes: string | null
          next_action: string | null
          next_action_at: string | null
          next_action_owner_id: string | null
          next_steps: string | null
          objections: string | null
          other_decision_makers: string | null
          potential_value: number | null
          probability: number | null
          problem: string | null
          timing: string | null
        }
        Insert: {
          budget_status?: string | null
          competitors?: string | null
          competitors_present?: string | null
          created_at?: string
          created_by?: string | null
          current_situation?: string | null
          deal_id?: string | null
          decision_makers?: Json | null
          discussed_points?: string | null
          expected_close_date?: string | null
          id?: string
          impact_notes?: string | null
          impacts?: string[] | null
          interest_level?: string | null
          interest_products?: string[] | null
          is_decision_maker?: string | null
          lead_id?: string | null
          meeting_id: string
          need_level?: string | null
          need_notes?: string | null
          next_action?: string | null
          next_action_at?: string | null
          next_action_owner_id?: string | null
          next_steps?: string | null
          objections?: string | null
          other_decision_makers?: string | null
          potential_value?: number | null
          probability?: number | null
          problem?: string | null
          timing?: string | null
        }
        Update: {
          budget_status?: string | null
          competitors?: string | null
          competitors_present?: string | null
          created_at?: string
          created_by?: string | null
          current_situation?: string | null
          deal_id?: string | null
          decision_makers?: Json | null
          discussed_points?: string | null
          expected_close_date?: string | null
          id?: string
          impact_notes?: string | null
          impacts?: string[] | null
          interest_level?: string | null
          interest_products?: string[] | null
          is_decision_maker?: string | null
          lead_id?: string | null
          meeting_id?: string
          need_level?: string | null
          need_notes?: string | null
          next_action?: string | null
          next_action_at?: string | null
          next_action_owner_id?: string | null
          next_steps?: string | null
          objections?: string | null
          other_decision_makers?: string | null
          potential_value?: number | null
          probability?: number | null
          problem?: string | null
          timing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_qualifications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_qualifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_qualifications_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_qualifications_next_action_owner_id_fkey"
            columns: ["next_action_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          cancel_reason: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          id: string
          lead_id: string | null
          meeting_url: string | null
          next_steps: string | null
          notes: string | null
          outcome: string | null
          owner_id: string | null
          participants: string | null
          previous_scheduled_at: string | null
          reschedule_reason: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          lead_id?: string | null
          meeting_url?: string | null
          next_steps?: string | null
          notes?: string | null
          outcome?: string | null
          owner_id?: string | null
          participants?: string | null
          previous_scheduled_at?: string | null
          reschedule_reason?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          lead_id?: string | null
          meeting_url?: string | null
          next_steps?: string | null
          notes?: string | null
          outcome?: string | null
          owner_id?: string | null
          participants?: string | null
          previous_scheduled_at?: string | null
          reschedule_reason?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          name: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          id?: string
          name: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          profile_id: string | null
          read: boolean
          title: string
          type: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          profile_id?: string | null
          read?: boolean
          title: string
          type?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          profile_id?: string | null
          read?: boolean
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_color: string | null
          created_at: string
          email: string | null
          id: string
          is_demo: boolean
          job_title: string | null
          name: string
          phone: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_color?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_demo?: boolean
          job_title?: string | null
          name: string
          phone?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_color?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_demo?: boolean
          job_title?: string | null
          name?: string
          phone?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          color: string
          created_at: string
          funnel_id: string
          id: string
          name: string
          position: number
          probability: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          funnel_id: string
          id?: string
          name: string
          position?: number
          probability?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          funnel_id?: string
          id?: string
          name?: string
          position?: number
          probability?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          description: string | null
          due_at: string
          id: string
          lead_id: string | null
          owner_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          reminder_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_at?: string
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_at?: string
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          kind: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connection_secrets: {
        Row: {
          api_key: string
          base_url: string
          connection_id: string
          created_at: string
          updated_at: string
          webhook_token: string
        }
        Insert: {
          api_key: string
          base_url: string
          connection_id: string
          created_at?: string
          updated_at?: string
          webhook_token?: string
        }
        Update: {
          api_key?: string
          base_url?: string
          connection_id?: string
          created_at?: string
          updated_at?: string
          webhook_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connection_secrets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          auto_create_lead: boolean
          created_at: string
          created_by: string | null
          id: string
          instance_name: string
          last_status_at: string | null
          name: string
          phone_number: string | null
          profile_name: string | null
          provider: string
          responsible_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          auto_create_lead?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          instance_name: string
          last_status_at?: string | null
          name: string
          phone_number?: string | null
          profile_name?: string | null
          provider?: string
          responsible_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          auto_create_lead?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          instance_name?: string
          last_status_at?: string | null
          name?: string
          phone_number?: string | null
          profile_name?: string | null
          provider?: string
          responsible_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_responsible_user_id_fkey"
            columns: ["responsible_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          assigned_user_id: string | null
          connection_id: string | null
          contact_name: string | null
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          lead_id: string | null
          phone: string
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          connection_id?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          lead_id?: string | null
          phone: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          connection_id?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          lead_id?: string | null
          phone?: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          connection_id: string | null
          conversation_id: string
          created_at: string
          direction: string
          error_message: string | null
          external_message_id: string | null
          id: string
          lead_id: string | null
          media_mime: string | null
          media_url: string | null
          message_type: string
          received_at: string | null
          recipient_phone: string | null
          sender_phone: string | null
          sent_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          connection_id?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          lead_id?: string | null
          media_mime?: string | null
          media_url?: string | null
          message_type?: string
          received_at?: string | null
          recipient_phone?: string | null
          sender_phone?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          connection_id?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          lead_id?: string | null
          media_mime?: string | null
          media_url?: string | null
          message_type?: string
          received_at?: string | null
          recipient_phone?: string | null
          sender_phone?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_quick_replies: {
        Row: {
          active: boolean
          body: string
          created_at: string
          id: string
          shortcut: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          id?: string
          shortcut: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          shortcut?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_all: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrador" | "gestor" | "vendedor"
      deal_status: "aberto" | "ganho" | "perdido"
      funnel_kind: "prospeccao" | "venda"
      meeting_status:
        | "agendada"
        | "realizada"
        | "no_show"
        | "reagendada"
        | "cancelada"
      task_priority: "baixa" | "media" | "alta" | "urgente"
      task_status: "pendente" | "em_andamento" | "concluida" | "cancelada"
      temperature: "frio" | "morno" | "quente"
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
      app_role: ["administrador", "gestor", "vendedor"],
      deal_status: ["aberto", "ganho", "perdido"],
      funnel_kind: ["prospeccao", "venda"],
      meeting_status: [
        "agendada",
        "realizada",
        "no_show",
        "reagendada",
        "cancelada",
      ],
      task_priority: ["baixa", "media", "alta", "urgente"],
      task_status: ["pendente", "em_andamento", "concluida", "cancelada"],
      temperature: ["frio", "morno", "quente"],
    },
  },
} as const
