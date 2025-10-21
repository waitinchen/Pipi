/**
 * Supabase客戶端配置
 * 用於連接本地Supabase實例
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 數據庫表類型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          status: 'active' | 'suspended' | 'banned'
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: string
          status?: 'active' | 'suspended' | 'banned'
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          status?: 'active' | 'suspended' | 'banned'
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      spirits: {
        Row: {
          id: string
          name: string
          avatar_style: string
          level: number
          xp: number
          status: 'active' | 'suspended'
          mood_state: any
          created_at: string
          updated_at: string
          last_interaction_at: string
        }
        Insert: {
          id?: string
          name: string
          avatar_style: string
          level?: number
          xp?: number
          status?: 'active' | 'suspended'
          mood_state?: any
          created_at?: string
          updated_at?: string
          last_interaction_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_style?: string
          level?: number
          xp?: number
          status?: 'active' | 'suspended'
          mood_state?: any
          created_at?: string
          updated_at?: string
          last_interaction_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          description: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          spirit_id: string
          content: string
          message_type: 'text' | 'image' | 'audio' | 'file'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          spirit_id: string
          content: string
          message_type?: 'text' | 'image' | 'audio' | 'file'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          spirit_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'audio' | 'file'
          created_at?: string
          updated_at?: string
        }
      }
      dashboard_stats: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          metric_type: 'counter' | 'gauge' | 'histogram'
          tags: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          metric_type?: 'counter' | 'gauge' | 'histogram'
          tags?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          metric_type?: 'counter' | 'gauge' | 'histogram'
          tags?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 實時訂閱服務
export class SupabaseRealtimeService {
  private subscriptions: Map<string, any> = new Map()

  /**
   * 訂閱用戶數據變化
   */
  subscribeToUsers(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        callback
      )
      .subscribe()

    this.subscriptions.set('users', subscription)
    return subscription
  }

  /**
   * 訂閱精靈數據變化
   */
  subscribeToSpirits(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('spirits-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'spirits' },
        callback
      )
      .subscribe()

    this.subscriptions.set('spirits', subscription)
    return subscription
  }

  /**
   * 訂閱消息數據變化
   */
  subscribeToMessages(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        callback
      )
      .subscribe()

    this.subscriptions.set('messages', subscription)
    return subscription
  }

  /**
   * 訂閱統計數據變化
   */
  subscribeToStats(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('stats-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_stats' },
        callback
      )
      .subscribe()

    this.subscriptions.set('stats', subscription)
    return subscription
  }

  /**
   * 取消所有訂閱
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription)
    })
    this.subscriptions.clear()
  }

  /**
   * 取消特定訂閱
   */
  unsubscribe(channel: string) {
    const subscription = this.subscriptions.get(channel)
    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(channel)
    }
  }
}

// 全局實時服務實例
export const realtimeService = new SupabaseRealtimeService()

// 數據庫操作服務
export class DatabaseService {
  /**
   * 獲取用戶列表
   */
  async getUsers(page: number = 1, limit: number = 10) {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * 獲取精靈列表
   */
  async getSpirits(page: number = 1, limit: number = 10) {
    const { data, error, count } = await supabase
      .from('spirits')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * 獲取房間列表
   */
  async getRooms(page: number = 1, limit: number = 10) {
    const { data, error, count } = await supabase
      .from('rooms')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * 獲取消息列表
   */
  async getMessages(page: number = 1, limit: number = 10) {
    const { data, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        users!messages_user_id_fkey(name, email),
        spirits!messages_spirit_id_fkey(name)
      `, { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * 獲取儀表板統計
   */
  async getDashboardStats() {
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // 將統計數據轉換為對象格式
    const stats: any = {}
    data?.forEach((stat) => {
      stats[stat.metric_name] = stat.metric_value
    })

    return stats
  }

  /**
   * 創建用戶
   */
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 更新用戶
   */
  async updateUser(id: string, userData: any) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 刪除用戶
   */
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * 創建精靈
   */
  async createSpirit(spiritData: any) {
    const { data, error } = await supabase
      .from('spirits')
      .insert(spiritData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 更新精靈
   */
  async updateSpirit(id: string, spiritData: any) {
    const { data, error } = await supabase
      .from('spirits')
      .update({ ...spiritData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 刪除精靈
   */
  async deleteSpirit(id: string) {
    const { error } = await supabase
      .from('spirits')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// 全局數據庫服務實例
export const dbService = new DatabaseService()


