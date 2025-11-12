"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  MoreHorizontal, 
  RefreshCw, 
  Share, 
  Loader2,
  FolderOpen,
  Globe,
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { ProjectModal } from "@/components/ui/ProjectModal";

type Project = {
  id: number;
  name: string;
  url: string;
  status: string;
};

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  loading?: boolean;
};

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

export function ProjectList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // Dummy projects list (Hardcoded)
  const [projects, setProjects] = useState<Project[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Invoice AI ${i + 1}`,
      url: `invoice-ai-${i + 1}.com`,
      status: i % 3 === 0 ? "Inactive" : "Active",
    }))
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMenu = (projectId: number) => {
    setOpenMenuId((prev) => (prev === projectId ? null : projectId));
  };

  const handleDelete = (id: number) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
    setOpenMenuId(null);
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditProject(null);
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setModalMode("edit");
    setEditProject(project);
    setShowModal(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    const csvContent = [
      ["Project Name", "Project URL", "Status"],
      ...projects.map((project) => [
        project.name,
        project.url,
        project.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(project => project.status === "Active").length,
    inactive: projects.filter(project => project.status === "Inactive").length,
  };

  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const statsData = [
    {
      title: "Total Projects",
      value: loading ? "..." : stats.total.toString(),
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      loading,
    },
    {
      title: "Active Projects",
      value: loading ? "..." : stats.active.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      loading,
    },
    {
      title: "Inactive Projects",
      value: loading ? "..." : stats.inactive.toString(),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      loading,
    },
  ];

  return (
    <div className="flex-1 p-8 bg-white min-h-screen">
      {/* Header with Projects Title and Refresh Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* Controls Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search projects..."
            className="w-80 h-10 bg-white border-gray-300"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={16} />
            Add New Project
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Projects Header Section - Remove the Projects title from here */}
        <div className="flex items-center justify-end px-6 py-4 border-b border-gray-200 bg-white">
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Share size={16} />
            Export
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={48} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Table Column Headers */}
            <div className="grid grid-cols-[3fr_2fr_2fr_1fr] items-center px-2 py-4 gap-x-4 font-semibold text-sm text-gray-700 bg-gray-50 border-b border-gray-200">
              <div>Project Name</div>
              <div>Project URL</div>
              <div>Status</div>
              <div className="text-right"></div>
            </div>

            {/* Table Body */}
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`grid grid-cols-[3fr_2fr_2fr_1fr] items-center px-6 py-4 gap-x-4 text-sm hover:bg-gray-50 transition-colors ${
                    index !== paginatedProjects.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-gray-700 font-mono text-sm">{project.url}</div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-end relative">
                    <button
                      className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => toggleMenu(project.id)}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>
                    {openMenuId === project.id && (
                      <div className="absolute top-[120%] right-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                        <button
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            openEditModal(project);
                            setOpenMenuId(null);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                          onClick={() => handleDelete(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-500">No projects found.</div>
                <div className="text-xs text-gray-400 mt-1">
                  Try adjusting your search terms or add a new project.
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="mt-6">
          <PaginationFooter
            totalItems={totalItems}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      )}

      {/* Modal */}
      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        initialData={modalMode === "edit" ? editProject ?? undefined : undefined}
        onSubmit={(projectData) => {
          if (modalMode === "add") {
            setProjects((prev) => [
              { id: prev.length + 1, ...projectData },
              ...prev,
            ]);
          } else if (modalMode === "edit" && editProject) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === editProject.id ? { ...p, ...projectData } : p
              )
            );
          }
          setShowModal(false);
        }}
      />
    </div>
  );
}