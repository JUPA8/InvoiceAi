"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  PlusCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
  Loader2,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectModal } from "@/components/ui/ProjectModal";
import type { Project } from "./page";
import {
  refreshProjectsAction,
  createProjectAction,
  updateProjectAction,
} from "@/app/actions/projectActions";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center w-32"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
    </button>
  );
}

export function ProjectClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleRefresh = () => {
    startRefreshTransition(() => {
      refreshProjectsAction();
    });
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentProject(null);
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setModalMode("edit");
    setCurrentProject(project);
    setShowModal(true);
  };

  const handleSubmit = async (formData: FormData) => {
    let result;
    if (modalMode === "add") {
      result = await createProjectAction(formData);
    } else if (modalMode === "edit" && currentProject) {
      result = await updateProjectAction(currentProject.id, formData);
    }

    if (result?.success) {
      setShowModal(false);
      alert(result.message);
    } else if (result?.message) {
      alert(`Error: ${result.message}`);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.isActive).length,
    inactive: projects.filter((p) => !p.isActive).length,
  };

  return (
    <div className="flex-1 p-8 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            Manage your client projects and their statuses.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={
            isRefreshing ? <Loader2 className="animate-spin" /> : stats.total
          }
          icon={FolderOpen}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Active Projects"
          value={
            isRefreshing ? <Loader2 className="animate-spin" /> : stats.active
          }
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Inactive Projects"
          value={
            isRefreshing ? <Loader2 className="animate-spin" /> : stats.inactive
          }
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects..."
            className="pl-10 w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700"
        >
          <PlusCircle size={16} /> Add New Project
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isRefreshing ? (
              <tr>
                <td colSpan={4} className="text-center py-24">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                </td>
              </tr>
            ) : paginatedProjects.length > 0 ? (
              paginatedProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {project.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-sm">
                    {project.applicationUrl}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-24">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3>No projects found</h3>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!isRefreshing && totalItems > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * rowsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Rows per page
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                >
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md disabled:opacity-50"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-md disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-md disabled:opacity-50"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        initialData={
          modalMode === "edit"
            ? {
                name: currentProject?.projectName || "",
                url: currentProject?.applicationUrl || "",
                status: currentProject?.isActive ? "Active" : "Inactive",
              }
            : undefined
        }
        onSubmit={SubmitButton}
      />
    </div>
  );
}
