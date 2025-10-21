/**
 * WebSocket實時數據更新服務
 * 用於LINYA Admin Console的實時數據同步
 */

export interface RealtimeMessage {
  type: 'user_update' | 'spirit_update' | 'chat_update' | 'metrics_update' | 'system_status';
  data: any;
  timestamp: number;
}

export class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;

  constructor(private url: string = 'ws://localhost:54321/realtime/v1/websocket') {}

  /**
   * 連接到WebSocket服務
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket連接已建立');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: RealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('解析WebSocket消息失敗:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket連接已關閉');
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket錯誤:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 斷開連接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * 訂閱特定類型的消息
   */
  subscribe(type: string, callback: Function): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  /**
   * 取消訂閱
   */
  unsubscribe(type: string, callback: Function): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 發送消息
   */
  send(message: RealtimeMessage): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket未連接，無法發送消息');
    }
  }

  /**
   * 處理接收到的消息
   */
  private handleMessage(message: RealtimeMessage): void {
    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error('執行回調函數時出錯:', error);
        }
      });
    }
  }

  /**
   * 嘗試重新連接
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`嘗試重新連接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('重新連接失敗:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('達到最大重連次數，停止重連');
    }
  }

  /**
   * 獲取連接狀態
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 實時數據更新Hook (React)
export function useRealtime<T>(type: string, initialData: T): T {
  const [data, setData] = React.useState<T>(initialData);
  
  React.useEffect(() => {
    const realtimeService = new RealtimeService();
    
    const handleUpdate = (newData: any) => {
      setData(newData);
    };
    
    realtimeService.subscribe(type, handleUpdate);
    realtimeService.connect();
    
    return () => {
      realtimeService.unsubscribe(type, handleUpdate);
      realtimeService.disconnect();
    };
  }, [type]);
  
  return data;
}

// 模擬實時數據服務（用於開發階段）
export class MockRealtimeService {
  private listeners: Map<string, Function[]> = new Map();
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.startMockDataGeneration();
  }

  subscribe(type: string, callback: Function): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  unsubscribe(type: string, callback: Function): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private startMockDataGeneration(): void {
    // 模擬用戶數據更新
    this.startInterval('user_update', () => {
      const mockUserData = {
        id: Math.floor(Math.random() * 1000),
        name: `用戶${Math.floor(Math.random() * 100)}`,
        status: Math.random() > 0.5 ? 'online' : 'offline',
        lastActive: new Date().toISOString()
      };
      this.notifyListeners('user_update', mockUserData);
    }, 5000);

    // 模擬精靈數據更新
    this.startInterval('spirit_update', () => {
      const mockSpiritData = {
        id: Math.floor(Math.random() * 100),
        name: `精靈${Math.floor(Math.random() * 50)}`,
        mood: ['happy', 'sad', 'excited', 'calm'][Math.floor(Math.random() * 4)],
        energy: Math.floor(Math.random() * 100)
      };
      this.notifyListeners('spirit_update', mockSpiritData);
    }, 3000);

    // 模擬聊天數據更新
    this.startInterval('chat_update', () => {
      const mockChatData = {
        id: Math.floor(Math.random() * 10000),
        userId: Math.floor(Math.random() * 100),
        message: `測試消息 ${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString()
      };
      this.notifyListeners('chat_update', mockChatData);
    }, 2000);

    // 模擬指標數據更新
    this.startInterval('metrics_update', () => {
      const mockMetricsData = {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        totalSpirits: Math.floor(Math.random() * 500) + 200,
        messagesToday: Math.floor(Math.random() * 1000) + 100
      };
      this.notifyListeners('metrics_update', mockMetricsData);
    }, 10000);
  }

  private startInterval(type: string, callback: Function, interval: number): void {
    const intervalId = setInterval(() => {
      callback();
    }, interval);
    this.intervalIds.set(type, intervalId);
  }

  private notifyListeners(type: string, data: any): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('執行模擬回調函數時出錯:', error);
        }
      });
    }
  }

  disconnect(): void {
    this.intervalIds.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.intervalIds.clear();
    this.listeners.clear();
  }
}

// 全局實時服務實例
export const realtimeService = new MockRealtimeService();




