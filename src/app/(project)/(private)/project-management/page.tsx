import * as projectService from "@/services/projectService";
import { ProjectClient } from "./project-client";

export type Project = {
  id: string;
  projectName: string;
  applicationUrl: string;
  isActive: boolean;
};

export const dynamic = "force-dynamic";

export default async function ProjectManagementPage() {
  const CLIENT_ID = "2";

  let projects: Project[] = [];
  try {
    projects = await projectService.getProjects(CLIENT_ID);
  } catch (error) {
    console.error("Failed to fetch projects on server:", error);
  }

  return <ProjectClient initialProjects={projects} />;
}
