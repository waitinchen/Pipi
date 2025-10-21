/**
 * 圖表可視化服務
 * 用於LINYA Admin Console的數據可視化
 */

import { LineChart, BarChart, PieChart, AreaChart } from 'recharts';

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData[];
  width?: number;
  height?: number;
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
}

export interface MetricsData {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  spirits: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  chats: {
    total: number;
    today: number;
    averagePerUser: number;
    growth: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    retention: number;
  };
}

export interface TimeSeriesData {
  date: string;
  users: number;
  spirits: number;
  chats: number;
  engagement: number;
}

export class ChartService {
  /**
   * 生成用戶增長圖表數據
   */
  static generateUserGrowthData(days: number = 30): ChartData[] {
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 50,
        newUsers: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 80) + 30
      });
    }
    
    return data;
  }

  /**
   * 生成精靈活躍度圖表數據
   */
  static generateSpiritActivityData(days: number = 30): ChartData[] {
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        spirits: Math.floor(Math.random() * 200) + 100,
        active: Math.floor(Math.random() * 150) + 80,
        newSpirits: Math.floor(Math.random() * 30) + 10
      });
    }
    
    return data;
  }

  /**
   * 生成聊天量圖表數據
   */
  static generateChatVolumeData(days: number = 30): ChartData[] {
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        messages: Math.floor(Math.random() * 1000) + 500,
        conversations: Math.floor(Math.random() * 100) + 50,
        averageLength: Math.floor(Math.random() * 50) + 20
      });
    }
    
    return data;
  }

  /**
   * 生成用戶分布餅圖數據
   */
  static generateUserDistributionData(): ChartData[] {
    return [
      { name: '新用戶', value: 35, color: '#8884d8' },
      { name: '活躍用戶', value: 45, color: '#82ca9d' },
      { name: '休眠用戶', value: 15, color: '#ffc658' },
      { name: '流失用戶', value: 5, color: '#ff7300' }
    ];
  }

  /**
   * 生成精靈情緒分布數據
   */
  static generateSpiritMoodData(): ChartData[] {
    return [
      { name: '開心', value: 40, color: '#ff6b6b' },
      { name: '平靜', value: 30, color: '#4ecdc4' },
      { name: '興奮', value: 20, color: '#45b7d1' },
      { name: '憂鬱', value: 10, color: '#96ceb4' }
    ];
  }

  /**
   * 生成時段活躍度數據
   */
  static generateHourlyActivityData(): ChartData[] {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour}:00`,
      users: Math.floor(Math.random() * 100) + 20,
      messages: Math.floor(Math.random() * 500) + 100
    }));
  }

  /**
   * 生成設備分布數據
   */
  static generateDeviceDistributionData(): ChartData[] {
    return [
      { name: '手機', value: 70, color: '#8884d8' },
      { name: '桌面', value: 20, color: '#82ca9d' },
      { name: '平板', value: 10, color: '#ffc658' }
    ];
  }

  /**
   * 生成地域分布數據
   */
  static generateRegionalData(): ChartData[] {
    return [
      { name: '台北', value: 35, users: 1250, color: '#8884d8' },
      { name: '新北', value: 25, users: 890, color: '#82ca9d' },
      { name: '桃園', value: 15, users: 534, color: '#ffc658' },
      { name: '台中', value: 12, users: 428, color: '#ff7300' },
      { name: '高雄', value: 8, users: 285, color: '#8dd1e1' },
      { name: '其他', value: 5, users: 178, color: '#d084d0' }
    ];
  }

  /**
   * 生成性能指標數據
   */
  static generatePerformanceMetrics(): ChartData[] {
    return [
      { name: '響應時間', value: 120, unit: 'ms', color: '#8884d8' },
      { name: '成功率', value: 99.8, unit: '%', color: '#82ca9d' },
      { name: '錯誤率', value: 0.2, unit: '%', color: '#ffc658' },
      { name: '吞吐量', value: 1250, unit: 'req/s', color: '#ff7300' }
    ];
  }

  /**
   * 生成用戶留存率數據
   */
  static generateRetentionData(): ChartData[] {
    return [
      { day: 'Day 1', retention: 100, color: '#8884d8' },
      { day: 'Day 3', retention: 85, color: '#82ca9d' },
      { day: 'Day 7', retention: 70, color: '#ffc658' },
      { day: 'Day 14', retention: 55, color: '#ff7300' },
      { day: 'Day 30', retention: 40, color: '#8dd1e1' }
    ];
  }

  /**
   * 生成收入數據
   */
  static generateRevenueData(months: number = 12): ChartData[] {
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      data.push({
        month: date.toLocaleDateString('zh-TW', { month: 'short' }),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        subscriptions: Math.floor(Math.random() * 100) + 50,
        oneTime: Math.floor(Math.random() * 20000) + 5000
      });
    }
    
    return data;
  }

  /**
   * 獲取預設顏色方案
   */
  static getDefaultColors(): string[] {
    return [
      '#8884d8', // 紫色
      '#82ca9d', // 綠色
      '#ffc658', // 黃色
      '#ff7300', // 橙色
      '#8dd1e1', // 藍色
      '#d084d0', // 粉色
      '#87d068', // 淺綠色
      '#ff7875'  // 紅色
    ];
  }

  /**
   * 格式化數字
   */
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * 格式化百分比
   */
  static formatPercentage(num: number): string {
    return num.toFixed(1) + '%';
  }

  /**
   * 生成隨機數據（用於測試）
   */
  static generateRandomData(count: number, min: number = 0, max: number = 100): ChartData[] {
    return Array.from({ length: count }, (_, i) => ({
      name: `項目${i + 1}`,
      value: Math.floor(Math.random() * (max - min + 1)) + min
    }));
  }
}

// 圖表配置預設值
export const CHART_CONFIGS = {
  LINE_CHART: {
    width: 800,
    height: 400,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    colors: ChartService.getDefaultColors()
  },
  BAR_CHART: {
    width: 800,
    height: 400,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    colors: ChartService.getDefaultColors()
  },
  PIE_CHART: {
    width: 400,
    height: 400,
    colors: ChartService.getDefaultColors()
  },
  AREA_CHART: {
    width: 800,
    height: 400,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    colors: ChartService.getDefaultColors()
  }
};

// 常用圖表數據生成器
export const CHART_GENERATORS = {
  userGrowth: () => ChartService.generateUserGrowthData(30),
  spiritActivity: () => ChartService.generateSpiritActivityData(30),
  chatVolume: () => ChartService.generateChatVolumeData(30),
  userDistribution: () => ChartService.generateUserDistributionData(),
  spiritMood: () => ChartService.generateSpiritMoodData(),
  hourlyActivity: () => ChartService.generateHourlyActivityData(),
  deviceDistribution: () => ChartService.generateDeviceDistributionData(),
  regionalData: () => ChartService.generateRegionalData(),
  performanceMetrics: () => ChartService.generatePerformanceMetrics(),
  retentionData: () => ChartService.generateRetentionData(),
  revenueData: () => ChartService.generateRevenueData(12)
};


