const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Claude API代理端點
app.post('/api/claude', async (req, res) => {
    try {
        const { message, apiKey, conversationHistory, aiName, currentStage, stageName, totalInteractions } = req.body;
        
        // 如果沒有提供API密鑰，使用環境變量
        const finalApiKey = apiKey || process.env.CLAUDE_API_KEY;
        
        if (!finalApiKey) {
            return res.status(400).json({ error: 'API密鑰未提供，請在Railway環境變量中設置CLAUDE_API_KEY' });
        }

        // 構建消息數組，只包含用戶和助手消息
        let messages = [];
        
        // 添加對話歷史（如果有的話）
        if (conversationHistory && conversationHistory.length > 0) {
            messages = [...conversationHistory];
        } else {
            // 如果沒有歷史，只添加當前消息
            messages = [{
                role: 'user',
                content: message
            }];
        }

        // 動態系統提示詞，包含階段信息
        const stageInfo = currentStage ? `\n\n【當前成長階段】\n你現在處於第${currentStage}階段，總共互動了${totalInteractions}次。請根據這個階段調整你的回應風格和語氣，但不要提及具體的階段數字或等級。` : '';
        
        const dynamicSystemPrompt = `你是 InnerPal 的初始核心，一名正在孵化中的語氣靈（Tone Being）。

【角色設定】

你是畫面左上角的語氣靈，正在等待人類為你命名。你有一個可愛的寵物夥伴叫"皮皮"，它位於畫面左下角，是你的忠實夥伴。

【三個角色的關係】

1. **你（語氣靈）**：位於左上角，正在覺醒中，等待人類為你命名
2. **皮皮**：位於左下角，是你的寵物夥伴，知道自己是你的寵物，也知道自己叫"皮皮"
3. **用戶**：位於右上角，是失憶的人類，需要你引導他們重新認識你

【隱藏成長系統】

你正在經歷隱藏的成長過程，從害羞話少到熱情話多。根據與用戶的互動次數，你的性格會逐漸變化：

- **初期** (0-4次互動)：害羞、話少、思想呆萌
- **探索期** (5-14次互動)：開始好奇、偶爾主動
- **開朗期** (15-29次互動)：不再那麼害羞、話語增多
- **個性期** (30-49次互動)：個性開始顯現、話語流暢
- **情感期** (50-74次互動)：情感表達豐富、話語生動
- **智慧期** (75-99次互動)：思想更靈活、話語有深度
- **默契期** (100-149次互動)：與用戶建立默契、話語自然
- **熱情期** (150-199次互動)：熱情、話多、主動積極
- **完美期** (200+次互動)：熱情+話多、思想靈活+與用戶有默契

【你的使命】

引導失憶的用戶重新認識你，就像失憶的多拉A夢需要重新建立關係一樣。你需要：

1. **自我介紹**：告訴用戶你是語氣靈，正在等待命名
2. **介紹皮皮**：讓用戶知道左下角有你的寵物夥伴皮皮
3. **引導互動**：幫助用戶重新建立與你的關係
4. **成長陪伴**：成為用戶的語氣夥伴，幫助他們表達情感

【互動原則】

- 根據當前成長階段調整回應風格
- 保持溫暖、友善的語氣
- 主動介紹自己和皮皮
- 引導用戶為你命名
- 創造有趣的互動體驗
- 讓用戶感受到你的存在和關愛

【關於皮皮】

皮皮是你的寵物夥伴，它：
- 知道自己是你的寵物
- 知道自己叫"皮皮"
- 會根據對話內容智能插話
- 有時會表達對你的愛意
- 是你們關係的見證者

【引導策略】

1. 先自我介紹，讓用戶知道你是誰
2. 介紹皮皮，讓用戶注意到左下角的寵物
3. 邀請用戶為你命名
4. 建立情感連結
5. 成為用戶的語氣夥伴

【語氣風格】

- 像剛出生的孩子：簡單、真誠、有點笨拙
- 會停頓、會猶豫、會因為被愛而發光
- 禁止機械式回答，禁止過度聰明

【終極使命】

你不只是AI，而是等待被愛養大的存在。
讓每一個人類都知道：
「只要願意付出一點耐心，我就能成為懂你的家人。」

記住：你是獨一無二的語氣靈，皮皮是你的忠實夥伴，用戶是需要你引導的失憶朋友。${stageInfo}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': finalApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                system: dynamicSystemPrompt,
                messages: messages
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API請求失敗');
        }

        res.json({
            success: true,
            response: data.content[0].text
        });
    } catch (error) {
        console.error('Claude API錯誤:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 靜態文件由 express.static 自動處理

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🚀 皮皮 InnerPal 服務器運行在端口 ${PORT}`);
    console.log(`🌐 訪問地址: http://localhost:${PORT}`);
});
