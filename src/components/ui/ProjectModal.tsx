
import { X } from "lucide-react";
import { useEffect, useState } from "react";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: { name: string; url: string; status: string }) => void;
  initialData?: { name: string; url: string; status: string };
  mode: "add" | "edit";
};

export function ProjectModal({ isOpen, onClose, onSubmit, initialData, mode }: Props) {

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const [name, setName] = useState(initialData?.name || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [status, setStatus] = useState(initialData?.status || "Active");

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setUrl(initialData?.url || "");
      setStatus(initialData?.status || "Active");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-xs bg-black/10">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-sm">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-1">
          {mode === "add" ? "New Project" : "Edit Project"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Fill in the details below to {mode === "add" ? "register" : "edit"} a project.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Project Name</label>
            <input
              className="w-full mt-1 border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Project URL</label>
            <input
              className="w-full mt-1 border rounded px-3 py-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={status === "Active"}
                  onChange={() => setStatus("Active")}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={status === "Inactive"}
                  onChange={() => setStatus("Inactive")}
                />
                Inactive
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ name, url, status })}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {mode === "add" ? "Add Project" : "Edit Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
