// 模擬數據服務
export interface User {
  id: string;
  email: string;
  handle: string;
  channel: string;
  status: 'active' | 'suspended' | 'banned';
  lastActiveAt: string;
  createdAt: string;
}

export interface Spirit {
  id: string;
  userId: string;
  name: string;
  avatarStyle: string;
  level: number;
  xp: number;
  moodState: {
    happiness: number;
    energy: number;
    social: number;
  };
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderSpiritId: string;
  content: string;
  contentType: string;
  safetyScore: number;
  createdAt: string;
}

export interface Room {
  id: string;
  type: 'spirit_spirit' | 'group' | 'public';
  visibility: 'observer_only' | 'private' | 'public';
  createdBy: string;
  createdAt: string;
  closedAt?: string;
}

// 模擬數據
export const mockUsers: User[] = [
  {
    id: 'user_001',
    email: 'rabbit@example.com',
    handle: '兔貝比',
    channel: 'LINE',
    status: 'active',
    lastActiveAt: '2024-12-01T13:20:00Z',
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'user_002',
    email: 'cat@example.com',
    handle: '小貓咪',
    channel: 'WEB',
    status: 'active',
    lastActiveAt: '2024-12-01T13:15:00Z',
    createdAt: '2024-12-01T09:30:00Z'
  },
  {
    id: 'user_003',
    email: 'dog@example.com',
    handle: '大狗狗',
    channel: 'APP',
    status: 'suspended',
    lastActiveAt: '2024-11-30T20:00:00Z',
    createdAt: '2024-11-30T15:00:00Z'
  }
];

export const mockSpirits: Spirit[] = [
  {
    id: 'spirit_001',
    userId: 'user_001',
    name: '大皮皮',
    avatarStyle: 'ʕ◉ᴥ◉ʔ',
    level: 5,
    xp: 1250,
    moodState: {
      happiness: 0.8,
      energy: 0.6,
      social: 0.9
    },
    status: 'active',
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'spirit_002',
    userId: 'user_002',
    name: '小可愛',
    avatarStyle: 'ʕ•ᴥ•ʔ',
    level: 3,
    xp: 750,
    moodState: {
      happiness: 0.9,
      energy: 0.8,
      social: 0.7
    },
    status: 'active',
    createdAt: '2024-12-01T09:30:00Z'
  }
];

export const mockRooms: Room[] = [
  {
    id: 'room_001',
    type: 'spirit_spirit',
    visibility: 'observer_only',
    createdBy: 'spirit_001',
    createdAt: '2024-12-01T13:00:00Z'
  },
  {
    id: 'room_002',
    type: 'spirit_spirit',
    visibility: 'private',
    createdBy: 'spirit_002',
    createdAt: '2024-12-01T12:30:00Z'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg_001',
    roomId: 'room_001',
    senderSpiritId: 'spirit_001',
    content: '你好！我是語氣靈，很高興與你對話。今天想聊什麼呢？',
    contentType: 'text',
    safetyScore: 0.1,
    createdAt: '2024-12-01T13:00:00Z'
  },
  {
    id: 'msg_002',
    roomId: 'room_001',
    senderSpiritId: 'spirit_002',
    content: '你好！我也很高興認識你！',
    contentType: 'text',
    safetyScore: 0.1,
    createdAt: '2024-12-01T13:01:00Z'
  }
];

// 模擬API服務
export class MockDataService {
  static async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模擬網路延遲
    return mockUsers;
  }

  static async getSpirits(): Promise<Spirit[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSpirits;
  }

  static async getRooms(): Promise<Room[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRooms;
  }

  static async getMessages(roomId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMessages.filter(msg => msg.roomId === roomId);
  }

  static async getDashboardStats() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      totalUsers: mockUsers.length,
      activeSpirits: mockSpirits.filter(s => s.status === 'active').length,
      todayMessages: mockMessages.length,
      activeRooms: mockRooms.length,
      systemHealth: 99.9,
      securityIncidents: 0
    };
  }
}




