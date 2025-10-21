# LINYA 總管理後台

這是靈芽(LINYA) 語氣靈養成平台的總管理後台系統。

## 功能特色

### 🎯 核心功能
- **用戶管理**：用戶註冊、狀態管理、渠道分析
- **語氣靈管理**：語氣靈檔案、等級系統、人格向量
- **對話監控**：即時對話觀測、安全稽核、舉報處理
- **內容庫管理**：人格模板、技能包、表情庫、Pipi行為卡
- **安全與合規**：敏感詞過濾、未成年保護、隱私控制
- **數據分析**：用戶增長、留存分析、成本控制

### 🏗️ 技術架構
- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **後端**：Supabase + PostgreSQL + pgvector
- **認證**：Supabase Auth + RBAC 權限控制
- **即時通訊**：Supabase Realtime
- **圖表**：Recharts + D3.js

## 快速開始

### 1. 安裝依賴
```bash
cd admin-console
npm install
```

### 2. 環境設定
創建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 啟動開發服務器
```bash
npm run dev
```

### 4. 訪問應用
打開 [http://localhost:3000](http://localhost:3000)

## 角色權限

### Super Admin
- 系統最高權限
- 管理租戶、金流、法規設定
- 機密金鑰管理

### Ops 站長
- 運維管理
- 服務健康監控
- 風控白名單、封鎖處理

### Curator 策展
- 內容管理
- 語氣靈人格模板
- 技能包、表情庫、Pipi行為卡

### Safety 版主
- 安全監管
- 對話稽核
- 舉報處理、屏蔽與冷卻處置

### Analyst 分析
- 數據分析
- 漏斗分析、留存分析
- A/B測試、成本與毛利

### CS 客服
- 客戶服務
- 個案查詢、退款
- 帳務與使用者支援

## 資料庫架構

### 核心表
- `users` - 用戶資料
- `spirits` - 語氣靈資料
- `pipi_pets` - Pipi寵物資料
- `rooms` - 對話房間
- `messages` - 對話訊息
- `observer_sessions` - 觀察者會話

### 管理表
- `persona_templates` - 人格模板
- `skill_packs` - 技能包
- `pipi_behaviors` - Pipi行為卡
- `reports` - 舉報記錄
- `admin_audit` - 管理員稽核

## 開發指南

### 專案結構
```
admin-console/
├── app/
│   ├── components/     # 可重用組件
│   ├── globals.css     # 全域樣式
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首頁
│   ├── providers.tsx   # 狀態提供者
│   └── login/          # 登入頁面
├── public/             # 靜態資源
├── package.json        # 依賴配置
├── next.config.js      # Next.js配置
├── tailwind.config.js  # Tailwind配置
└── README.md          # 專案說明
```

### 開發規範
- 使用 TypeScript 進行類型檢查
- 遵循 ESLint 代碼規範
- 使用 Tailwind CSS 進行樣式設計
- 組件採用函數式組件 + Hooks
- 狀態管理使用 Zustand

### 部署
```bash
# 建構生產版本
npm run build

# 啟動生產服務器
npm start
```

## 監控與維護

### 系統監控
- 用戶活躍度監控
- 系統性能監控
- 錯誤率監控
- 成本控制監控

### 安全監控
- 登入異常監控
- 敏感操作稽核
- 資料存取記錄
- 安全事件告警

## 貢獻指南

1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 發起 Pull Request

## 授權

本專案採用 MIT 授權條款。





