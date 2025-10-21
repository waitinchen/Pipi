-- 創建用戶表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_uid VARCHAR(255) UNIQUE,
    line_display_name VARCHAR(255),
    line_avatar_url TEXT,
    custom_llm_name VARCHAR(10) DEFAULT 'LINYA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建聊天會話表
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255) DEFAULT '新對話',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建皮皮反應記錄表
CREATE TABLE IF NOT EXISTS pipi_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL,
    reaction_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建七弦心境記錄表
CREATE TABLE IF NOT EXISTS heart_window_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(20) NOT NULL CHECK (mood IN ('normal', 'happy', 'excited', 'sad')),
    intensity FLOAT DEFAULT 1.0 CHECK (intensity >= 0 AND intensity <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_users_line_uid ON users(line_uid);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_pipi_reactions_user_id ON pipi_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_window_states_user_id ON heart_window_states(user_id);

-- 創建更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要updated_at的表添加觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 啟用行級安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipi_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE heart_window_states ENABLE ROW LEVEL SECURITY;

-- 創建基本的安全策略（允許所有操作，實際部署時需要更嚴格的策略）
CREATE POLICY "Allow all operations for authenticated users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON chat_sessions
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON chat_messages
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON pipi_reactions
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON heart_window_states
    FOR ALL USING (true);





