// Supabase客戶端配置
import { createClient } from './node_modules/@supabase/supabase-js/dist/main/index.js';

// 本地開發環境配置
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// 創建Supabase客戶端
export const supabase = createClient(supabaseUrl, supabaseKey);

// 數據庫操作函數
export class DatabaseService {
    // 用戶相關操作
    static async createOrUpdateUser(userData) {
        const { data, error } = await supabase
            .from('users')
            .upsert(userData, { 
                onConflict: 'line_uid',
                ignoreDuplicates: false 
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getUserByLineUid(lineUid) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('line_uid', lineUid)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async updateCustomLlmName(userId, customName) {
        const { data, error } = await supabase
            .from('users')
            .update({ custom_llm_name: customName })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // 聊天會話相關操作
    static async createChatSession(userId, sessionName = '新對話') {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: userId,
                session_name: sessionName
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getChatSessions(userId) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    // 聊天消息相關操作
    static async createMessage(sessionId, userId, role, content, metadata = {}) {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                user_id: userId,
                role: role,
                content: content,
                metadata: metadata
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getMessagesBySession(sessionId) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data;
    }

    // 皮皮反應相關操作
    static async recordPipiReaction(userId, messageId, reactionType, reactionContent) {
        const { data, error } = await supabase
            .from('pipi_reactions')
            .insert({
                user_id: userId,
                message_id: messageId,
                reaction_type: reactionType,
                reaction_content: reactionContent
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // 七弦心境相關操作
    static async recordHeartWindowState(userId, mood, intensity = 1.0) {
        const { data, error } = await supabase
            .from('heart_window_states')
            .insert({
                user_id: userId,
                mood: mood,
                intensity: intensity
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getLatestHeartWindowState(userId) {
        const { data, error } = await supabase
            .from('heart_window_states')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
}

// 實時訂閱功能
export class RealtimeService {
    static subscribeToMessages(sessionId, callback) {
        return supabase
            .channel(`messages:${sessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            }, callback)
            .subscribe();
    }

    static subscribeToPipiReactions(userId, callback) {
        return supabase
            .channel(`pipi_reactions:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'pipi_reactions',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    }

    static subscribeToHeartWindowStates(userId, callback) {
        return supabase
            .channel(`heart_window_states:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'heart_window_states',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    }
}





