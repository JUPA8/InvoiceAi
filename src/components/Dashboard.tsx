"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FolderEdit, 
  Calculator, 
  Tag, 
  Users2, 
  KeyRound, 
  Settings, 
  ArrowLeftToLine,
  ChevronRight,
  ChevronsUpDown,
  Share,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  timezoneOffset: number;
  isActive: boolean;
  maxRequests?: number;
  timeWindow?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  applicationName: string;
  applicationUrl: string;
  isActive: boolean;
  clientId: string;
  createdAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  clientId: string;
  membershipType?: number;
  isActive?: boolean;
}

interface ApiKey {
  id: string;
  key: string;
  isRevoked: boolean;
  clientId: string;
  createdAt?: string;
}

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  totalUsers: number;
  totalApiKeys: number;
  revokedApiKeys: number;
}

interface SidebarItemProps {
  icon: any;
  label: string;
  hasChevron?: boolean;
  isActive?: boolean;
  href?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  loading?: boolean;
}

// Invoice AI API Client
class InvoiceAIClient {
  private baseUrl: string;
  private userKey: string;
  private credentials: { username: string; password: string };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.userKey = typeof window !== 'undefined' ? localStorage.getItem('userKey') || '' : '';
    this.credentials = { username: '', password: '' };
  }

  setCredentials(username: string, password: string) {
    this.credentials = { username, password };
  }

  setUserKey(userKey: string) {
    this.userKey = userKey;
    if (typeof window !== 'undefined') {
      localStorage.setItem('userKey', userKey);
    }
  }

  getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (includeAuth && this.userKey) {
      headers['X-USER-KEY'] = this.userKey;
    }

    return headers;
  }

  getBasicAuth() {
    const token = btoa(`${this.credentials.username}:${this.credentials.password}`);
    return `Basic ${token}`;
  }

  async apiRequest(endpoint: string, method = 'GET', body: any = null, requiresAuth = true) {
    const config: RequestInit = {
      method,
      headers: this.getHeaders(requiresAuth)
    };

    if (requiresAuth) {
      config.headers = {
        ...config.headers,
        'Authorization': this.getBasicAuth()
      };
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Auth methods
  async login(username: string, password: string) {
    this.setCredentials(username, password);
    const result = await this.apiRequest('/api/v1/Account/Login', 'POST', { username, password }, false);
    if (result.userKey) this.setUserKey(result.userKey);
    return result;
  }

  // Client methods
  async getClients() {
    return await this.apiRequest('/api/v1/Clients?query.ShowAll=true', 'GET');
  }

  // Project methods
  async getProjects(clientId: string) {
    return await this.apiRequest(`/api/v1/clients/${clientId}/projects?query.ShowAll=true`, 'GET');
  }

  async getAllProjects() {
    const clients = await this.getClients();
    const allProjects: Project[] = [];
    
    for (const client of clients) {
      try {
        const projects = await this.getProjects(client.id);
        allProjects.push(...projects.map((p: any) => ({ ...p, clientId: client.id })));
      } catch (error) {
        console.warn(`Failed to fetch projects for client ${client.id}:`, error);
      }
    }
    
    return allProjects;
  }

  // User methods
  async getUsers(clientId: string) {
    return await this.apiRequest(`/api/v1/clients/${clientId}/users?query.ShowAll=true`, 'GET');
  }

  async getAllUsers() {
    const clients = await this.getClients();
    const allUsers: User[] = [];
    
    for (const client of clients) {
      try {
        const users = await this.getUsers(client.id);
        allUsers.push(...users.map((u: any) => ({ ...u, clientId: client.id })));
      } catch (error) {
        console.warn(`Failed to fetch users for client ${client.id}:`, error);
      }
    }
    
    return allUsers;
  }

  // API Key methods
  async getApiKeys(clientId: string) {
    return await this.apiRequest(`/api/v1/clients/${clientId}/keys?query.ShowAll=true`, 'GET');
  }

  async getAllApiKeys() {
    const clients = await this.getClients();
    const allKeys: ApiKey[] = [];
    
    for (const client of clients) {
      try {
        const keys = await this.getApiKeys(client.id);
        allKeys.push(...keys.map((k: any) => ({ ...k, clientId: client.id })));
      } catch (error) {
        console.warn(`Failed to fetch API keys for client ${client.id}:`, error);
      }
    }
    
    return allKeys;
  }

  isAuthenticated() {
    return !!this.userKey && !!this.credentials.username;
  }
}

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    totalUsers: 0,
    totalApiKeys: 0,
    revokedApiKeys: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiClient, setApiClient] = useState<InvoiceAIClient | null>(null);

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-url.com';
  const DEFAULT_USERNAME = process.env.NEXT_PUBLIC_DEFAULT_USERNAME || 'admin@local.com';
  const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || 'Abc@1234';

  // Initialize API client
  useEffect(() => {
    const client = new InvoiceAIClient(API_BASE_URL);
    setApiClient(client);
    
    // Auto-login with default credentials
    const initializeAuth = async () => {
      try {
        await client.login(DEFAULT_USERNAME, DEFAULT_PASSWORD);
        console.log('Successfully authenticated with Invoice AI API');
      } catch (error) {
        console.warn('Failed to authenticate with default credentials:', error);
      }
    };

    initializeAuth();
  }, [API_BASE_URL, DEFAULT_USERNAME, DEFAULT_PASSWORD]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [clientsData, projectsData, usersData, apiKeysData] = await Promise.allSettled([
        apiClient.getClients(),
        apiClient.getAllProjects(),
        apiClient.getAllUsers(),
        apiClient.getAllApiKeys()
      ]);

      // Handle clients data
      const resolvedClients = clientsData.status === 'fulfilled' 
        ? (Array.isArray(clientsData.value) ? clientsData.value : clientsData.value.data || [])
        : [];
      setClients(resolvedClients);

      // Handle projects data
      const resolvedProjects = projectsData.status === 'fulfilled' 
        ? (Array.isArray(projectsData.value) ? projectsData.value : [])
        : [];
      setProjects(resolvedProjects);

      // Handle users data
      const resolvedUsers = usersData.status === 'fulfilled' 
        ? (Array.isArray(usersData.value) ? usersData.value : [])
        : [];
      setUsers(resolvedUsers);

      // Handle API keys data
      const resolvedApiKeys = apiKeysData.status === 'fulfilled' 
        ? (Array.isArray(apiKeysData.value) ? apiKeysData.value : [])
        : [];
      setApiKeys(resolvedApiKeys);

      // Calculate stats
      const activeClientsCount = resolvedClients.filter((client: Client) => client.isActive).length;
      const revokedKeysCount = resolvedApiKeys.filter((key: ApiKey) => key.isRevoked).length;

      setStats({
        totalClients: resolvedClients.length,
        activeClients: activeClientsCount,
        totalProjects: resolvedProjects.length,
        totalUsers: resolvedUsers.length,
        totalApiKeys: resolvedApiKeys.length,
        revokedApiKeys: revokedKeysCount
      });

      // Log any failed requests
      if (clientsData.status === 'rejected') {
        console.error('Failed to fetch clients:', clientsData.reason);
      }
      if (projectsData.status === 'rejected') {
        console.error('Failed to fetch projects:', projectsData.reason);
      }
      if (usersData.status === 'rejected') {
        console.error('Failed to fetch users:', usersData.reason);
      }
      if (apiKeysData.status === 'rejected') {
        console.error('Failed to fetch API keys:', apiKeysData.reason);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      
      // Load fallback data
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Load fallback data
  const loadFallbackData = () => {
    const fallbackClients: Client[] = [
      { id: '1', name: 'Microsoft Corp', timezoneOffset: -5, isActive: true, maxRequests: 1000, timeWindow: 60 },
      { id: '2', name: 'Google LLC', timezoneOffset: -8, isActive: true, maxRequests: 500, timeWindow: 60 },
      { id: '3', name: 'Amazon Web Services', timezoneOffset: -5, isActive: false, maxRequests: 800, timeWindow: 60 }
    ];

    const fallbackProjects: Project[] = [
      { id: '1', applicationName: 'Invoice App 1', applicationUrl: 'https://app1.com', isActive: true, clientId: '1' },
      { id: '2', applicationName: 'Invoice App 2', applicationUrl: 'https://app2.com', isActive: true, clientId: '2' }
    ];

    const fallbackUsers: User[] = [
      { id: '1', username: 'user1@microsoft.com', email: 'user1@microsoft.com', firstName: 'John', lastName: 'Doe', phoneNumber: '+1234567890', clientId: '1' },
      { id: '2', username: 'user2@google.com', email: 'user2@google.com', firstName: 'Jane', lastName: 'Smith', phoneNumber: '+1234567891', clientId: '2' }
    ];

    setClients(fallbackClients);
    setProjects(fallbackProjects);
    setUsers(fallbackUsers);
    setStats({
      totalClients: fallbackClients.length,
      activeClients: 2,
      totalProjects: fallbackProjects.length,
      totalUsers: fallbackUsers.length,
      totalApiKeys: 5,
      revokedApiKeys: 1
    });
  };

  // Load data on component mount
  useEffect(() => {
    if (apiClient) {
      fetchDashboardData();
    }
  }, [apiClient]);

  // Statistics data
  const statsData = [
    {
      title: "Total Clients",
      value: loading ? "..." : stats.totalClients.toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      loading
    },
    {
      title: "Active Clients",
      value: loading ? "..." : stats.activeClients.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      loading
    },
    {
      title: "Total Projects",
      value: loading ? "..." : stats.totalProjects.toString(),
      icon: FolderEdit,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      loading
    },
    {
      title: "Total Users",
      value: loading ? "..." : stats.totalUsers.toString(),
      icon: Users2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      loading
    },
    {
      title: "API Keys",
      value: loading ? "..." : stats.totalApiKeys.toString(),
      icon: KeyRound,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      loading
    },
    {
      title: "Revoked Keys",
      value: loading ? "..." : stats.revokedApiKeys.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      loading
    }
  ];

  const SidebarItem: React.FC<SidebarItemProps> = ({ 
    icon: Icon, 
    label, 
    hasChevron = false, 
    isActive = false,
    href
  }) => {
    const content = (
      <div className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-700" />
          <span className="text-sm text-gray-900">{label}</span>
        </div>
        {hasChevron && <ChevronRight size={16} className="text-gray-400" />}
      </div>
    );

    if (href) {
      return (
        <Link href={href}>
          {content}
        </Link>
      );
    }

    return content;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, loading = false }) => {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
            <div className={`text-2xl font-bold ${color} flex items-center gap-2`}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : value}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon size={24} className={color} />
          </div>
        </div>
      </div>
    );
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Client Name', 'Status', 'Timezone Offset', 'Max Requests', 'Projects Count', 'Users Count'],
      ...clients.map(client => [
        client.name,
        client.isActive ? 'Active' : 'Inactive',
        client.timezoneOffset.toString(),
        client.maxRequests?.toString() || 'N/A',
        projects.filter(p => p.clientId === client.id).length.toString(),
        users.filter(u => u.clientId === client.id).length.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        {/* User Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">Admin User</div>
              <div className="text-xs text-gray-600">{DEFAULT_USERNAME}</div>
            </div>
            <ChevronsUpDown size={16} className="text-gray-600" />
          </div>
        </div>

        {/* Workspace Section */}
        <div className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-4 px-2">Workspace</div>
          <div className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive href="/dashboard" />
            <SidebarItem icon={FileSpreadsheet} label="Invoices" href="/invoices" />
            <SidebarItem icon={FolderEdit} label="Projects" hasChevron />
            <SidebarItem icon={Calculator} label="Cost Centers" hasChevron />
            <SidebarItem icon={Tag} label="Expense Type" hasChevron />
          </div>
        </div>

        {/* Administration Section */}
        <div className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-4 px-2">Administration</div>
          <div className="space-y-1">
            <SidebarItem icon={Users2} label="Clients" />
            <SidebarItem icon={KeyRound} label="API Keys" />
            <SidebarItem icon={Settings} label="Settings" />
            <SidebarItem icon={ArrowLeftToLine} label="Logout" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Connection Status */}
        <div className={`mb-6 border rounded-lg p-4 ${
          apiClient?.isAuthenticated() 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className={apiClient?.isAuthenticated() ? 'text-green-800' : 'text-yellow-800'}>
            <strong>API Status:</strong> {
              apiClient?.isAuthenticated() 
                ? 'Connected to Invoice AI API' 
                : 'Connecting to Invoice AI API...'
            }
          </div>
          <div className={`text-sm mt-1 ${
            apiClient?.isAuthenticated() ? 'text-green-600' : 'text-yellow-600'
          }`}>
            Base URL: {API_BASE_URL}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>API Error:</strong> {error}
            </div>
            <div className="text-red-600 text-sm mt-1">
              Some data may be unavailable. Showing fallback data where possible.
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              loading={stat.loading}
            />
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Client Activity Chart */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Activity</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 size={48} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization</p>
                    <p className="text-sm text-gray-400">{stats.activeClients} of {stats.totalClients} clients active</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resource Usage Chart */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resource Usage</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 size={48} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Calculator size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Usage analytics</p>
                    <p className="text-sm text-gray-400">{stats.totalApiKeys} API keys, {stats.revokedApiKeys} revoked</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Clients Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Clients</h2>
            <button 
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Share size={16} />
              Export
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={48} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Timezone</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rate Limit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Projects</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{client.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium text-white ${
                            client.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {client.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          UTC{client.timezoneOffset >= 0 ? '+' : ''}{client.timezoneOffset}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {client.maxRequests ? `${client.maxRequests}/min` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {projects.filter(p => p.clientId === client.id).length}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {users.filter(u => u.clientId === client.id).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Table Footer */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">
                    Showing {Math.min(rowsPerPage, clients.length)} of {clients.length} clients
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Rows per page</span>
                      <select 
                        value={rowsPerPage} 
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    
                    <div className="text-sm font-medium text-gray-900">
                      Page {currentPage} of {Math.ceil(clients.length / rowsPerPage)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                      <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        onClick={() => setCurrentPage(Math.min(Math.ceil(clients.length / rowsPerPage), currentPage + 1))}
                        disabled={currentPage === Math.ceil(clients.length / rowsPerPage)}
                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => setCurrentPage(Math.ceil(clients.length / rowsPerPage))}
                        disabled={currentPage === Math.ceil(clients.length / rowsPerPage)}
                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;