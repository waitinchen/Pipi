-- LINYA 總管理後台資料庫架構
-- 擴展現有架構，添加管理後台所需的功能

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. 用戶與語氣靈管理
-- 用戶表（擴展現有）
ALTER TABLE users ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'web';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT NOW();

-- 語氣靈表（擴展現有）
ALTER TABLE spirits ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE spirits ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE spirits ADD COLUMN IF NOT EXISTS mood_state JSONB DEFAULT '{"happiness": 0.5, "energy": 0.5, "social": 0.5}';
ALTER TABLE spirits ADD COLUMN IF NOT EXISTS privacy_opt_in BOOLEAN DEFAULT false;
ALTER TABLE spirits ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE spirits ADD COLUMN IF NOT EXISTS persona_vector VECTOR(1536);

-- Pipi 寵物表
CREATE TABLE IF NOT EXISTS pipi_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_id UUID REFERENCES spirits(id) ON DELETE CASCADE,
    energy DECIMAL(3,2) DEFAULT 0.5 CHECK (energy >= 0 AND energy <= 1),
    affection DECIMAL(3,2) DEFAULT 0.5 CHECK (affection >= 0 AND affection <= 1),
    quirks_profile JSONB DEFAULT '{}',
    behavior_seed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 語氣靈身份表
CREATE TABLE IF NOT EXISTS spirit_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_id UUID REFERENCES spirits(id) ON DELETE CASCADE,
    identity_hash VARCHAR(64) UNIQUE NOT NULL,
    public_handle VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    badges JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 社交關係
-- 好友關係表
CREATE TABLE IF NOT EXISTS friend_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_a UUID REFERENCES spirits(id) ON DELETE CASCADE,
    spirit_b UUID REFERENCES spirits(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    since TIMESTAMP DEFAULT NOW(),
    UNIQUE(spirit_a, spirit_b),
    CHECK (spirit_a != spirit_b)
);

-- 3. 對話系統
-- 對話房間表
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'spirit_spirit' CHECK (type IN ('spirit_spirit', 'group', 'public')),
    visibility VARCHAR(20) DEFAULT 'observer_only' CHECK (visibility IN ('observer_only', 'private', 'public')),
    created_by UUID REFERENCES spirits(id),
    created_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);

-- 訊息表（擴展現有）
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_spirit_id UUID REFERENCES spirits(id);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS safety_score DECIMAL(3,2);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS vector_embedding VECTOR(1536);

-- 觀察者會話表
CREATE TABLE IF NOT EXISTS observer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_token VARCHAR(64) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- 4. 內容管理
-- 人格模板表
CREATE TABLE IF NOT EXISTS persona_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    base_prompt TEXT NOT NULL,
    tools_acl JSONB DEFAULT '[]',
    model_preset JSONB DEFAULT '{}',
    safety_preset JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 技能包表
CREATE TABLE IF NOT EXISTS skill_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    rag_dataset_id UUID[],
    tool_caps JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pipi 行為卡表
CREATE TABLE IF NOT EXISTS pipi_behaviors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    trigger JSONB NOT NULL,
    cooldown_s INTEGER DEFAULT 300,
    script JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 安全與稽核
-- 舉報表
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id),
    message_id UUID REFERENCES chat_messages(id),
    reporter UUID REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    triage_state VARCHAR(20) DEFAULT 'pending' CHECK (triage_state IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 管理員稽核表
CREATE TABLE IF NOT EXISTS admin_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id UUID,
    diff JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. 營運與經濟
-- 訂閱方案表
CREATE TABLE IF NOT EXISTS billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 經濟帳本表
CREATE TABLE IF NOT EXISTS economy_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    spirit_id UUID REFERENCES spirits(id),
    type VARCHAR(50) NOT NULL,
    delta DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 實驗與分析
-- A/B 實驗表
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key VARCHAR(100) NOT NULL,
    variants JSONB NOT NULL,
    targeting_rule JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. 索引優化
-- 用戶相關索引
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_channel ON users(channel);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

-- 語氣靈相關索引
CREATE INDEX IF NOT EXISTS idx_spirits_user_id ON spirits(user_id);
CREATE INDEX IF NOT EXISTS idx_spirits_status ON spirits(status);
CREATE INDEX IF NOT EXISTS idx_spirits_level ON spirits(level);
CREATE INDEX IF NOT EXISTS idx_spirits_persona_vector ON spirits USING ivfflat (persona_vector vector_cosine_ops);

-- 對話相關索引
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_visibility ON rooms(visibility);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_spirit ON chat_messages(sender_spirit_id);
CREATE INDEX IF NOT EXISTS idx_messages_vector ON chat_messages USING ivfflat (vector_embedding vector_cosine_ops);

-- 社交關係索引
CREATE INDEX IF NOT EXISTS idx_friend_edges_spirit_a ON friend_edges(spirit_a);
CREATE INDEX IF NOT EXISTS idx_friend_edges_spirit_b ON friend_edges(spirit_b);
CREATE INDEX IF NOT EXISTS idx_friend_edges_status ON friend_edges(status);

-- 觀察者會話索引
CREATE INDEX IF NOT EXISTS idx_observer_sessions_room ON observer_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_observer_sessions_viewer ON observer_sessions(viewer_user_id);

-- 9. RLS 策略
-- 啟用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spirits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipi_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE spirit_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE observer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;

-- 用戶只能看到自己的資料
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 語氣靈只能被擁有者管理
CREATE POLICY "Spirits can be managed by owner" ON spirits
    FOR ALL USING (auth.uid() = user_id);

-- Pipi 寵物只能被擁有者管理
CREATE POLICY "Pipi pets can be managed by owner" ON pipi_pets
    FOR ALL USING (auth.uid() = (SELECT user_id FROM spirits WHERE id = spirit_id));

-- 好友關係只能被相關方查看
CREATE POLICY "Friend edges can be viewed by participants" ON friend_edges
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM spirits WHERE id = spirit_a) OR
        auth.uid() = (SELECT user_id FROM spirits WHERE id = spirit_b)
    );

-- 觀察者會話只能被會話擁有者查看
CREATE POLICY "Observer sessions can be viewed by owner" ON observer_sessions
    FOR SELECT USING (auth.uid() = viewer_user_id);

-- 10. 觸發器
-- 更新時間戳觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要 updated_at 的表添加觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spirits_updated_at BEFORE UPDATE ON spirits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipi_pets_updated_at BEFORE UPDATE ON pipi_pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_templates_updated_at BEFORE UPDATE ON persona_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_packs_updated_at BEFORE UPDATE ON skill_packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipi_behaviors_updated_at BEFORE UPDATE ON pipi_behaviors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. 視圖
-- 活躍用戶統計視圖
CREATE OR REPLACE VIEW active_users_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users,
    COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '1 day') as dau,
    COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '7 days') as wau,
    COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '30 days') as mau
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 語氣靈活躍度視圖
CREATE OR REPLACE VIEW spirit_activity_stats AS
SELECT 
    s.id,
    s.name,
    s.level,
    s.xp,
    s.mood_state,
    COUNT(DISTINCT m.id) as message_count,
    COUNT(DISTINCT fe.id) as friend_count,
    MAX(m.created_at) as last_message_at
FROM spirits s
LEFT JOIN chat_messages m ON s.id = m.sender_spirit_id
LEFT JOIN friend_edges fe ON s.id = fe.spirit_a OR s.id = fe.spirit_b
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.level, s.xp, s.mood_state;

-- 12. 函數
-- 獲取語氣靈推薦列表
CREATE OR REPLACE FUNCTION get_spirit_recommendations(
    target_spirit_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    spirit_id UUID,
    name VARCHAR(50),
    similarity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        1 - (s.persona_vector <=> target.persona_vector) as similarity
    FROM spirits s
    CROSS JOIN (SELECT persona_vector FROM spirits WHERE id = target_spirit_id) as target
    WHERE s.id != target_spirit_id
    AND s.status = 'active'
    AND s.privacy_opt_in = true
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 檢查好友關係
CREATE OR REPLACE FUNCTION are_friends(
    spirit_a_id UUID,
    spirit_b_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM friend_edges 
        WHERE ((spirit_a = spirit_a_id AND spirit_b = spirit_b_id) OR
               (spirit_a = spirit_b_id AND spirit_b = spirit_a_id))
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql;





