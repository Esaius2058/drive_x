import { Link } from "react-router-dom";
import { Progress } from "./Progress";
import { useRef, useState } from "react";
import { uploadSingleFile } from "../services/upload";

type SideBarTab =
  | "recent"
  | "my-files"
  | "shared"
  | "trash"
  | "storage"
  | "starred";

type AdminSideBarTab =
  | "overview"
  | "users"
  | "files"
  | "settings"
  | "logs"
  | "feedback";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  description?: string; 
}

type SideBarProps = {
  token: string;
  activeButton: SideBarTab;
  setActiveButton: React.Dispatch<React.SetStateAction<SideBarTab>>;
  usedStorage: string;
  setusedStorage: string;
  storage: string;
  usedStoragePercentage: number;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
};

type AdminSideBarProps = {
  activeButton: AdminSideBarTab;
  setActiveButton: React.Dispatch<React.SetStateAction<AdminSideBarTab>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

const SideBar = ({
  activeButton,
  setActiveButton,
  usedStorage,
  storage,
  usedStoragePercentage,
  setNotification
}: SideBarProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = event.currentTarget.name;
    setActiveButton(buttonName as SideBarTab);
  };

  const uploadForm = useRef<HTMLFormElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = uploadForm.current;
    if (!form) return;


    try {
      const formData = new FormData();
      const fileInput = form.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement | null;

      if (!fileInput?.files?.length || fileInput.files.length === 0) {
        setNotification({
          message: "Select a file first",
          description: "Please select a file to upload.",
          type: "warning",
        });
        console.error("Select a file to upload");
        return;
      }

      formData.append('file', fileInput.files[0]);
      console.log("File Input", fileInput);
      
      const result = await uploadSingleFile(formData);
      setNotification({
        message: "File uploaded successfully",
        description: `${file?.name} has been uploaded`,
        type: "success"
      });
      console.log("Upload successful:", result);
    } catch (error: any) {
      console.error("Upload error:", error.message, "Field error", error.field);
        setNotification({
          message: "Upload Failed.",
          description: "There was an error uploading your file. Please try again.",
          type: "error",
        });
    }

    const handleUploadFolder = async (e: React.FormEvent) => {
      e.preventDefault();
    };
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-items">
        <button
          className={`sidebar-item ${
            activeButton === "recent" ? "sidebar-active" : ""
          }`}
          name="recent"
          onClick={handleButtonClick}
        >
          <img src="/icons/clock-regular.svg" alt="files" className="sidebar-icon" />
          <span>Recent Files</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "my-files" ? "sidebar-active" : ""
          }`}
          name="my-files"
          onClick={handleButtonClick}
        >
          <img
            src="/icons/folder-closed-regular.svg"
            alt="files"
            className="sidebar-icon"
          />
          <span>My Files</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "shared" ? "sidebar-active" : ""
          }`}
          name="shared"
          onClick={handleButtonClick}
        >
          <img src="/icons/users-solid.svg" alt="shared" className="sidebar-icon" />
          <span>Shared with me</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "starred" ? "sidebar-active" : ""
          }`}
          name="starred"
          onClick={handleButtonClick}
        >
          <img src="/icons/star-regular.svg" alt="starred" className="sidebar-icon" />
          <span>Starred</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "trash" ? "sidebar-active" : ""
          }`}
          name="trash"
          onClick={handleButtonClick}
        >
          <img src="/icons/trash-solid.svg" alt="trash" className="sidebar-icon" />
          <span>Trash</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "storage" ? "sidebar-active" : ""
          }`}
          name="storage"
          onClick={handleButtonClick}
        >
          <img src="/icons/cloud-solid.svg" alt="storage" className="sidebar-icon" />
          <span>Storage</span>
        </button>
        <div className="sidebar-storage">
          <Progress value={usedStoragePercentage} />
          <p>
            {usedStorage} of {storage} used
          </p>
        </div>
      </div>
      <div className="sidebar-footer">
        <h3>Drag and Drop</h3>
        <form onSubmit={handleUpload} ref={uploadForm}>
          <input
            id="file"
            name="file"
            type="file"
            onChange={handleFileChange}
            className="sidebar-upload-button"
            required
          />
          <button type="submit" className="primary-btn">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminSideBar = ({
  activeButton,
  setActiveButton,
  setNotification
}: AdminSideBarProps) => {
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = event.currentTarget.name;
    setActiveButton(buttonName as AdminSideBarTab);
  };

  const uploadForm = useRef<HTMLFormElement>(null);
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = uploadForm.current;
    if (!form) return;

    try {
      const formData = new FormData(form);
      const fileInput = form.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement | null;

      if (!fileInput?.files?.length || fileInput.files.length === 0) {
        setNotification({
          message: "Select a file first",
          type: "error",
        });
        console.error("Select a file to upload");
        return;
      }

      formData.append('file', fileInput.files[0]);
      console.log("File Input", fileInput);
      
      const result = await uploadSingleFile(formData);
      console.log("Upload successful:", result);
    } catch (error: any) {
      // Handle error
      if (error instanceof Error) {
        console.error("Upload error:", error.message);
        setNotification({
          message: error.message,
          type: "error",
        });
      } else {
        console.error("Upload error:", error.message, "Field error", error.field);
        setNotification({
          message: "Failed to upload file. Try again.",
          type: "error",
        });
      }
    }

    const handleUploadFolder = async (e: React.FormEvent) => {
      e.preventDefault();
    };
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-items">
        <button
          className={`sidebar-item ${
            activeButton === "overview" ? "sidebar-active" : ""
          }`}
          name="overview"
          onClick={handleButtonClick}
        >
          <img src="/icons/clock-regular.svg" alt="files" className="sidebar-icon" />
          <span>Overview</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "users" ? "sidebar-active" : ""
          }`}
          name="users"
          onClick={handleButtonClick}
        >
          <img
            src="/icons/folder-closed-regular.svg"
            alt="files"
            className="sidebar-icon"
          />
          <span>Users</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "files" ? "sidebar-active" : ""
          }`}
          name="files"
          onClick={handleButtonClick}
        >
          <img src="/icons/users-solid.svg" alt="shared" className="sidebar-icon" />
          <span>File</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "settings" ? "sidebar-active" : ""
          }`}
          name="settings"
          onClick={handleButtonClick}
        >
          <img src="/icons/star-regular.svg" alt="starred" className="sidebar-icon" />
          <span>Settings</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "logs" ? "sidebar-active" : ""
          }`}
          name="logs"
          onClick={handleButtonClick}
        >
          <img src="/icons/trash-solid.svg" alt="trash" className="sidebar-icon" />
          <span>Logs</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "feedback" ? "sidebar-active" : ""
          }`}
          name="feedback"
          onClick={handleButtonClick}
        >
          <img src="/icons/cloud-solid.svg" alt="storage" className="sidebar-icon" />
          <span>Feedback</span>
        </button>
      </div>
      <div className="sidebar-footer">
        <h3>Drag and Drop</h3>
        <form onSubmit={handleUpload} ref={uploadForm}>
          <input
            type="file"
            className="sidebar-upload-button"
            id="file"
            name="file"
          />
          <button type="submit" className="primary-btn">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export {SideBar, AdminSideBar};
