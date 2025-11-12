"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Loader2,
  FileText,
  CheckCircle,
  FolderEdit,
  Users2,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getCostCenterChartData } from "@/app/actions/dashboardActions";

// --- Types and Constants ---

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  loading?: boolean;
};

interface ChartData {
  name: string;
  value: number;
}

const PIE_CHART_COLORS = ["#0088FE", "#00C49F"];

// --- Components ---

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${color}`}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : value}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );
}

// --- Main Dashboard Page ---

export default function Dashboard() {
  // --- State Management ---
  const [stats, setStats] = useState<any>({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    totalUsers: 0,
    totalApiKeys: 0,
    revokedApiKeys: 0,
  });
  const [costCenterData, setCostCenterData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setChartLoading(true);
      try {
        // Fetch main dashboard stats (replace mock data)
        setTimeout(() => {
          setStats({
            totalClients: 2,
            activeClients: 1,
            totalProjects: 2,
            totalUsers: 2,
            totalApiKeys: 5,
            revokedApiKeys: 1,
          });
          setLoading(false);
        }, 1000);

        // Fetch cost center data
        const costData = await getCostCenterChartData();
        setCostCenterData(costData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data.");
        setChartError("Could not load chart data.");
      } finally {
        // Ensure all loading states are false
        setLoading(false);
        setChartLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Handlers ---
  function handleRefresh() {
    // This would re-trigger your data fetching function
    console.log("Refreshing data...");
  }

  // --- Derived Data for Charts ---
  const clientActivityData = [
    { name: "Active", clients: stats.activeClients },
    {
      name: "Inactive",
      clients: stats.totalClients - stats.activeClients,
    },
  ];

  const statsCardsData = [
    { title: "Total Clients", value: stats.totalClients.toString(), icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50", loading },
    { title: "Active Clients", value: stats.activeClients.toString(), icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50", loading },
    { title: "Total Projects", value: stats.totalProjects.toString(), icon: FolderEdit, color: "text-purple-600", bgColor: "bg-purple-50", loading },
    { title: "Total Users", value: stats.totalUsers.toString(), icon: Users2, color: "text-orange-600", bgColor: "bg-orange-50", loading },
    { title: "API Keys", value: stats.totalApiKeys.toString(), icon: KeyRound, color: "text-indigo-600", bgColor: "bg-indigo-50", loading },
    { title: "Revoked Keys", value: stats.revokedApiKeys.toString(), icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50", loading },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={loading || chartLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading || chartLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <strong>API Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statsCardsData.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Client Activity Chart - NEW BAR CHART */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Client Activity
          </h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 size={48} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientActivityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clients" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cost Center Chart - PIE CHART */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Cost Center Status
          </h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            {chartLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 size={48} className="animate-spin text-gray-400" />
              </div>
            ) : chartError ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-red-600">
                <AlertTriangle size={48} className="mb-4" />
                <p>{chartError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costCenterData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {costCenterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}