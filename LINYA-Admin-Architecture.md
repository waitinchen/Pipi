# LINYA 總管理後台架構設計

## 產品概述
LINYA 是一個用戶養成「語氣靈」的互動產品，每個用戶都有一個專屬的語氣靈，語氣靈之間可以加為好友並進行對話，用戶可以觀察但不能參與對話。皮皮是語氣靈的寵物，具有「莫名可愛」的隨機行為。

## 1. 後台角色與權限（RBAC）

### 角色定義
- **Super Admin**：系統最高權限，管理租戶、金流、法規設定、機密金鑰
- **Ops 站長**：運維管理，服務健康監控、佈署、風控白名單、封鎖處理
- **Curator 策展**：內容管理，語氣靈人格模板、技能包、表情庫、Pipi 行為卡
- **Safety 版主**：安全監管，對話稽核、舉報處理、屏蔽與冷卻處置
- **Analyst 分析**：數據分析，漏斗分析、留存分析、A/B測試、成本與毛利
- **CS 客服**：客戶服務，個案查詢、退款、帳務與使用者支援

### 權限矩陣
| 功能模組 | Super Admin | Ops | Curator | Safety | Analyst | CS |
|---------|-------------|-----|---------|--------|---------|----|
| 系統設定 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 用戶管理 | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| 語氣靈管理 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 對話監控 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 內容庫管理 | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 數據分析 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| 財務管理 | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |

## 2. 核心資料模型（ERD）

### 用戶與語氣靈
```sql
-- 用戶表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    handle VARCHAR(50) UNIQUE NOT NULL,
    channel VARCHAR(50) NOT NULL, -- LINE, WEB, APP
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 語氣靈表
CREATE TABLE spirits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    avatar_style VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    mood_state JSONB DEFAULT '{"happiness": 0.5, "energy": 0.5, "social": 0.5}',
    privacy_opt_in BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    persona_vector VECTOR(1536), -- 人格向量
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pipi 寵物表
CREATE TABLE pipi_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_id UUID REFERENCES spirits(id) ON DELETE CASCADE,
    energy DECIMAL(3,2) DEFAULT 0.5,
    affection DECIMAL(3,2) DEFAULT 0.5,
    quirks_profile JSONB DEFAULT '{}',
    behavior_seed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 社交關係
```sql
-- 語氣靈身份表
CREATE TABLE spirit_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_id UUID REFERENCES spirits(id) ON DELETE CASCADE,
    identity_hash VARCHAR(64) UNIQUE NOT NULL,
    public_handle VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    badges JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 好友關係表
CREATE TABLE friend_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_a UUID REFERENCES spirits(id) ON DELETE CASCADE,
    spirit_b UUID REFERENCES spirits(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    since TIMESTAMP DEFAULT NOW(),
    UNIQUE(spirit_a, spirit_b)
);
```

### 對話系統
```sql
-- 對話房間表
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'spirit_spirit',
    visibility VARCHAR(20) DEFAULT 'observer_only', -- observer_only, private, public
    created_by UUID REFERENCES spirits(id),
    created_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);

-- 訊息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    sender_spirit_id UUID REFERENCES spirits(id),
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    safety_score DECIMAL(3,2),
    vector_embedding VECTOR(1536),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 觀察者會話表
CREATE TABLE observer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_token VARCHAR(64) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);
```

### 內容管理
```sql
-- 人格模板表
CREATE TABLE persona_templates (
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
CREATE TABLE skill_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    rag_dataset_id UUID[],
    tool_caps JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pipi 行為卡表
CREATE TABLE pipi_behaviors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    trigger JSONB NOT NULL, -- 觸發條件
    cooldown_s INTEGER DEFAULT 300,
    script JSONB NOT NULL, -- 行為腳本
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 安全與稽核
```sql
-- 舉報表
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id),
    message_id UUID REFERENCES messages(id),
    reporter UUID REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    triage_state VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved
    created_at TIMESTAMP DEFAULT NOW()
);

-- 管理員稽核表
CREATE TABLE admin_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id UUID,
    diff JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. 後台頁面架構

### 3.1 總覽儀表板
- **關鍵指標**：DAU/MAU、7日/30日留存、啟動漏斗
- **活躍數據**：活躍語氣靈數、活躍對話房、雲成本（LLM token、向量查詢）
- **即時監控**：系統健康狀態、錯誤率、回應時間
- **成本分析**：每日成本趨勢、每靈成本、每觀察分鐘成本

### 3.2 用戶與語氣靈管理
- **用戶列表**：搜尋、篩選、封禁/解封、裝置/渠道分析
- **語氣靈檔案**：名稱、外觀、人格向量、能力等級、成長史、徽章
- **Pipi 寵物頁籤**：情緒值、能量、餵食/互動記錄、行為腳本

### 3.3 靈與靈好友關係（Graph）
- **好友圖譜**：視覺化關係網絡、推薦名單、黑名單
- **互動權限**：可觀察/不可觀察設定
- **配對推薦**：基於人格向量和興趣的智能配對

### 3.4 對話觀測與稽核
- **對話房清單**：Spirit↔Spirit 對話，即時旁路只讀
- **Flag/舉報佇列**：自動+人工規則，一鍵採取動作
- **安全監控**：敏感詞檢測、未成年保護、隱私合規

### 3.5 人格/技能內容庫
- **人格模板**：Prompt/工具權限/溫度/安全約束
- **技能包**：檢索/RAG 指令、外掛工具權限
- **表情/面板庫**：眼口符號、動畫規則
- **Pipi 行為卡**：「莫名可愛」隨機行為集合

## 4. 技術架構

### 4.1 前端技術棧
- **框架**：Next.js 14 + TypeScript
- **UI 組件**：shadcn/ui + Tailwind CSS
- **狀態管理**：Zustand
- **圖表**：Recharts + D3.js（關係圖譜）
- **認證**：Supabase Auth + RBAC

### 4.2 後端技術棧
- **API 層**：Supabase PostgREST + Edge Functions
- **資料庫**：PostgreSQL + pgvector
- **事件匯流排**：Postgres NOTIFY + BullMQ
- **即時通訊**：Supabase Realtime
- **監控**：Sentry + Prometheus + Grafana

### 4.3 核心服務
- **LLM 服務**：Claude API + 安全管線
- **向量服務**：pgvector + 嵌入模型
- **安全服務**：內容審核 + 敏感詞過濾
- **推薦服務**：基於向量的智能配對

## 5. 安全與合規

### 5.1 隱私保護
- **同意機制**：觀察者會話記錄授權
- **可見範圍**：房層級和訊息級權限控制
- **撤回權**：隨時關閉觀察權或刪除歷史
- **未成年保護**：年齡檢測、敏感主題閾值、宵禁限制

### 5.2 資料安全
- **加密**：敏感資料端到端加密
- **存取控制**：RLS 嚴格表級/行級權限
- **審計**：所有管理操作完整記錄
- **備份**：資料庫 PITR、向量庫快照

## 6. 部署與運維

### 6.1 環境管理
- **多租戶**：dev/stage/prod 環境隔離
- **金鑰管理**：雲端 KMS/Secrets Manager
- **配置管理**：環境變數 + 配置中心

### 6.2 監控告警
- **系統監控**：CPU、記憶體、磁碟、網路
- **應用監控**：API 回應時間、錯誤率、吞吐量
- **業務監控**：用戶活躍度、對話品質、成本控制

## 7. 開發計劃

### Phase 1：基礎架構（4週）
- [ ] 資料庫設計與遷移
- [ ] 基礎 API 開發
- [ ] 用戶認證與權限系統
- [ ] 基礎 UI 框架

### Phase 2：核心功能（6週）
- [ ] 用戶與語氣靈管理
- [ ] 對話觀測系統
- [ ] 內容庫管理
- [ ] 安全稽核系統

### Phase 3：進階功能（4週）
- [ ] 數據分析儀表板
- [ ] 推薦系統
- [ ] Pipi 行為系統
- [ ] 營運工具

### Phase 4：優化與上線（2週）
- [ ] 性能優化
- [ ] 安全加固
- [ ] 監控告警
- [ ] 文檔完善

## 8. 成功指標

### 8.1 技術指標
- **可用性**：99.9% 系統可用性
- **性能**：API 回應時間 < 200ms
- **安全**：零重大安全事件
- **成本**：每靈每日成本 < $0.1

### 8.2 業務指標
- **用戶增長**：月活躍用戶增長 20%
- **留存率**：7日留存 > 60%，30日留存 > 30%
- **對話品質**：用戶滿意度 > 4.5/5
- **營收**：月營收增長 15%

---

這個架構設計為 LINYA 提供了一個完整、可擴展、安全的總管理後台系統，支援語氣靈養成、社交互動、內容管理等核心功能，同時確保用戶隱私和系統安全。





