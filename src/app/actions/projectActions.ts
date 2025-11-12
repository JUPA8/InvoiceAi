"use server";

import { revalidatePath } from "next/cache";
import * as projectService from "@/services/projectService";
const CLIENT_ID = "2"; 

export async function createProjectAction(formData: FormData) {
  try {
    const newProject = {
      projectName: formData.get("name") as string,
      applicationUrl: formData.get("url") as string,
      isActive: formData.get("status") === "Active",
    };
    await projectService.createProject(CLIENT_ID, newProject);
    revalidatePath("/project-management");
    return { success: true, message: "Project created successfully." };
  } catch (error) {
    console.error("Create Project Error:", error);
    return { success: false, message: "Failed to create project." };
  }
}

export async function updateProjectAction(projectId: string, formData: FormData) {
    try {
      const updatedProject = {
        id: projectId,
        projectName: formData.get("name") as string,
        applicationUrl: formData.get("url") as string,
        isActive: formData.get("status") === "Active",
      };
      await projectService.updateProject(CLIENT_ID, projectId, updatedProject);
      revalidatePath("/project-management");
      return { success: true, message: "Project updated successfully." };
    } catch (error) {
      console.error("Update Project Error:", error);
      return { success: false, message: "Failed to update project." };
    }
}

export async function deleteProjectAction(projectId: string) {
  try {
    await projectService.deleteProject(CLIENT_ID, projectId);
    revalidatePath("/project-management");
  } catch (error) {
    console.error("Delete Project Error:", error);
  }
}

export async function refreshProjectsAction() {
  revalidatePath("/project-management");
}