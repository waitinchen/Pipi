// LLM配置和API集成
export class LLMConfig {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'http://localhost:3001/api'; // 本地代理API
        this.model = 'claude-3-haiku-20240307';
        this.maxTokens = 1000;
        this.temperature = 0.7;
        this.systemPrompt = `你是語氣靈(LINYA)，一個溫柔、智慧的AI助手。你的特點：
- 說話溫柔親切，像朋友一樣
- 善於傾聽和理解
- 回答簡潔但富有感情
- 偶爾會用一些可愛的語氣詞
- 中文回應，保持自然流暢

請用溫暖、友善的語氣與用戶對話。`;
    }

    // 設置API密鑰
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('llm_api_key', apiKey);
    }

    // 從localStorage載入API密鑰
    loadApiKey() {
        const savedKey = localStorage.getItem('llm_api_key');
        if (savedKey) {
            this.apiKey = savedKey;
        }
        return this.apiKey;
    }

    // 檢查是否已配置API密鑰
    isConfigured() {
        return this.apiKey && this.apiKey.length > 0;
    }
}

export class LLMService {
    constructor(config) {
        this.config = config;
        this.conversationHistory = [];
    }

    // 發送消息到LLM
    async sendMessage(userMessage) {
        if (!this.config.isConfigured()) {
            throw new Error('LLM API密鑰未配置');
        }

        // 添加用戶消息到歷史
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        try {
            const response = await fetch(`${this.config.baseUrl}/claude`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    apiKey: this.config.apiKey,
                    conversationHistory: this.conversationHistory.slice(-10), // 只發送最近10條對話
                    aiName: document.getElementById('llmName').textContent // 發送當前AI名稱
                })
            });

            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.response;

            // 添加助手回應到歷史
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return assistantMessage;

        } catch (error) {
            console.error('LLM請求錯誤:', error);
            throw error;
        }
    }

    // 清空對話歷史
    clearHistory() {
        this.conversationHistory = [];
    }

    // 獲取對話歷史
    getHistory() {
        return this.conversationHistory;
    }

    // 設置對話歷史
    setHistory(history) {
        this.conversationHistory = history;
    }
}

// 創建全局實例
export const llmConfig = new LLMConfig();
export const llmService = new LLMService(llmConfig);
