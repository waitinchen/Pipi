'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  MessageCircle, 
  Settings, 
  BarChart3, 
  Shield, 
  Heart,
  Eye,
  Database,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { MockDataService, User, Spirit, Room, Message } from '../../lib/mockData'
import { useAuth } from '../providers'
import { realtimeService } from '../../lib/realtime'
import { rbacService, ROLES, PERMISSIONS } from '../../lib/rbac'
import { ChartService, CHART_GENERATORS } from '../../lib/charts'
import { LineChart, BarChart, PieChart, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color?: string
}

function MetricCard({ title, value, change, icon, color = 'blue' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState<any>({})
  const [selectedChart, setSelectedChart] = useState<'users' | 'spirits' | 'chats'>('users')

  // 初始化RBAC
  useEffect(() => {
    if (user) {
      // 模擬設置用戶角色（實際應用中會從API獲取）
      const mockUser = {
        id: user.id,
        email: user.email,
        role: ROLES.ADMIN, // 預設為管理員角色
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      rbacService.setCurrentUser(mockUser);
    }
  }, [user]);

  // 設置實時數據更新
  useEffect(() => {
    const handleMetricsUpdate = (newData: any) => {
      setRealTimeData(prev => ({
        ...prev,
        metrics: newData
      }));
    };

    const handleUserUpdate = (newUser: any) => {
      setRealTimeData(prev => ({
        ...prev,
        users: [...(prev.users || []), newUser]
      }));
    };

    const handleSpiritUpdate = (newSpirit: any) => {
      setRealTimeData(prev => ({
        ...prev,
        spirits: [...(prev.spirits || []), newSpirit]
      }));
    };

    // 訂閱實時數據更新
    realtimeService.subscribe('metrics_update', handleMetricsUpdate);
    realtimeService.subscribe('user_update', handleUserUpdate);
    realtimeService.subscribe('spirit_update', handleSpiritUpdate);

    return () => {
      realtimeService.unsubscribe('metrics_update', handleMetricsUpdate);
      realtimeService.unsubscribe('user_update', handleUserUpdate);
      realtimeService.unsubscribe('spirit_update', handleSpiritUpdate);
    };
  }, []);

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersData, spiritsData, roomsData, statsData] = await Promise.all([
        MockDataService.getUsers(),
        MockDataService.getSpirits(),
        MockDataService.getRooms(),
        MockDataService.getDashboardStats()
      ])
      setUsers(usersData)
      setSpirits(spiritsData)
      setRooms(roomsData)
      setStats(statsData)
    } catch (error) {
      console.error('載入數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const sidebarItems = [
    { id: 'overview', label: '總覽儀表板', icon: BarChart3 },
    { id: 'users', label: '用戶管理', icon: Users },
    { id: 'spirits', label: '語氣靈管理', icon: Heart },
    { id: 'conversations', label: '對話監控', icon: MessageCircle },
    { id: 'content', label: '內容庫管理', icon: Database },
    { id: 'safety', label: '安全稽核', icon: Shield },
    { id: 'observers', label: '觀察者管理', icon: Eye },
    { id: 'settings', label: '系統設定', icon: Settings },
  ]

  const metrics = stats ? [
    {
      title: '總用戶數',
      value: stats.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: 'blue'
    },
    {
      title: '活躍語氣靈',
      value: stats.activeSpirits.toLocaleString(),
      change: '+8.2%',
      icon: <Heart className="h-6 w-6 text-pink-600" />,
      color: 'pink'
    },
    {
      title: '今日對話數',
      value: stats.todayMessages.toLocaleString(),
      change: '+15.3%',
      icon: <MessageCircle className="h-6 w-6 text-green-600" />,
      color: 'green'
    },
    {
      title: '活躍房間',
      value: stats.activeRooms.toLocaleString(),
      change: '+5.7%',
      icon: <Eye className="h-6 w-6 text-purple-600" />,
      color: 'purple'
    },
    {
      title: '系統健康度',
      value: `${stats.systemHealth}%`,
      change: '+0.1%',
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      color: 'emerald'
    },
    {
      title: '安全事件',
      value: stats.securityIncidents.toString(),
      change: '-2',
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      color: 'orange'
    }
  ] : []

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* 側邊欄 */}
        <div className="admin-sidebar">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary">LINYA 管理後台</h1>
            <p className="text-sm text-muted-foreground mt-1">語氣靈養成平台</p>
          </div>
          
          <nav className="mt-8">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-muted transition-colors ${
                    activeTab === item.id ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* 主內容區 */}
        <div className="flex-1">
          {/* 頂部導航 */}
          <div className="admin-header">
            <h2 className="text-xl font-semibold">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">實時更新</span>
              </div>
              <span className="text-sm text-muted-foreground">{user?.name || '管理員'}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {rbacService.getCurrentUser()?.role.name}
              </span>
              <button 
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                登出
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">A</span>
              </div>
            </div>
          </div>

          {/* 內容區域 */}
          <div className="admin-main">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 指標卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                  ))}
                </div>

                {/* 圖表區域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="chart-container">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">數據可視化</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedChart('users')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            selectedChart === 'users' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          用戶增長
                        </button>
                        <button
                          onClick={() => setSelectedChart('spirits')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            selectedChart === 'spirits' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          精靈活躍
                        </button>
                        <button
                          onClick={() => setSelectedChart('chats')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            selectedChart === 'chats' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          聊天量
                        </button>
                      </div>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        {selectedChart === 'users' && (
                          <LineChart data={CHART_GENERATORS.userGrowth()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <LineChart type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                            <LineChart type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
                          </LineChart>
                        )}
                        {selectedChart === 'spirits' && (
                          <AreaChart data={CHART_GENERATORS.spiritActivity()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <AreaChart type="monotone" dataKey="spirits" stackId="1" stroke="#8884d8" fill="#8884d8" />
                            <AreaChart type="monotone" dataKey="active" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                          </AreaChart>
                        )}
                        {selectedChart === 'chats' && (
                          <BarChart data={CHART_GENERATORS.chatVolume()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <BarChart dataKey="messages" fill="#8884d8" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    <h3 className="text-lg font-semibold mb-4">用戶分布</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={CHART_GENERATORS.userDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {CHART_GENERATORS.userDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 最近活動 */}
                <div className="chart-container">
                  <h3 className="text-lg font-semibold mb-4">最近活動</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">新用戶註冊：兔貝比</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2分鐘前</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">語氣靈對話：大皮皮 ↔ 小可愛</span>
                      </div>
                      <span className="text-xs text-muted-foreground">5分鐘前</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">安全事件：敏感詞檢測</span>
                      </div>
                      <span className="text-xs text-muted-foreground">10分鐘前</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">用戶管理</h3>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    新增用戶
                  </button>
                </div>
                
                <div className="chart-container">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>用戶ID</th>
                          <th>暱稱</th>
                          <th>渠道</th>
                          <th>狀態</th>
                          <th>註冊時間</th>
                          <th>最後活躍</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.handle}</td>
                            <td>{user.channel}</td>
                            <td>
                              <span className={`status-badge status-${user.status === 'active' ? 'active' : user.status === 'suspended' ? 'suspended' : 'banned'}`}>
                                {user.status === 'active' ? '活躍' : user.status === 'suspended' ? '暫停' : '封禁'}
                              </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>{new Date(user.lastActiveAt).toLocaleString()}</td>
                            <td>
                              <button className="text-primary hover:underline mr-2">編輯</button>
                              <button className="text-destructive hover:underline">
                                {user.status === 'active' ? '封禁' : '解封'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'spirits' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">語氣靈管理</h3>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    新增語氣靈
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spirits.map((spirit) => (
                      <div key={spirit.id} className="chart-container">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
                            {spirit.avatarStyle}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{spirit.name}</h4>
                            <p className="text-sm text-muted-foreground">等級 {spirit.level} • 經驗 {spirit.xp.toLocaleString()}</p>
                            <div className="flex space-x-2 mt-2">
                              <span className={`status-badge status-${spirit.status === 'active' ? 'active' : 'suspended'}`}>
                                {spirit.status === 'active' ? '活躍' : '暫停'}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <div>快樂度: {Math.round(spirit.moodState.happiness * 100)}%</div>
                              <div>能量: {Math.round(spirit.moodState.energy * 100)}%</div>
                              <div>社交: {Math.round(spirit.moodState.social * 100)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 其他標籤頁內容 */}
            {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'spirits' && (
              <div className="chart-container">
                <h3 className="text-lg font-semibold mb-4">
                  {sidebarItems.find(item => item.id === activeTab)?.label}
                </h3>
                <div className="text-center py-12 text-muted-foreground">
                  此功能正在開發中...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
