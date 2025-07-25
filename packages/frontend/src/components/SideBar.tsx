import { Link } from "react-router-dom";
import { Progress } from "./Progress";
import { useRef, useState } from "react";
import { uploadSingleFile } from "../services/upload";
import { LoadingSpinner } from "./LoadingScreen";
import { File, FilePlus2, X } from "lucide-react";

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
  setusedStorage: React.Dispatch<React.SetStateAction<string>>;
  storage: string;
  usedStoragePercentage: number;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
};

type AdminSideBarProps = {
  activeButton: AdminSideBarTab;
  setActiveButton: React.Dispatch<React.SetStateAction<AdminSideBarTab>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
};

const SideBar = ({
  activeButton,
  setActiveButton,
  usedStorage,
  storage,
  usedStoragePercentage,
  setNotification,
}: SideBarProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sidebarTabs = [
    { name: "recent", label: "Recent", icon: "/icons/clock-regular.svg" },
    {
      name: "my-files",
      label: "My Files",
      icon: "/icons/folder-closed-regular.svg",
    },
    { name: "shared", label: "Shared", icon: "/icons/users-solid.svg" },
    { name: "storage", label: "Storage", icon: "/icons/cloud-solid.svg" },
    { name: "starred", label: "Starred", icon: "/icons/star-regular.svg" },
    { name: "trash", label: "Trash", icon: "/icons/trash-solid.svg" },
  ];

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = event.currentTarget.name;
    setActiveButton(buttonName as SideBarTab);
  };

  const uploadForm = useRef<HTMLFormElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentFile = event.target.files?.[0];
    if (currentFile) {
      setSelectedFile(currentFile);
      setCurrentFileName(currentFile.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = uploadForm.current;
    if (!form) return;

    try {
      setIsUploading(true);
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

      formData.append("file", fileInput.files[0]);
      console.log("File Input", fileInput);

      const result = await uploadSingleFile(formData);
      setNotification({
        message: "File uploaded successfully",
        description: `${currentFileName} has been uploaded`,
        type: "success",
      });
      console.log("Upload successful:", result);
    } catch (error: any) {
      console.error("Upload error:", error.message, "Field error", error.field);
      setNotification({
        message: "Upload Failed.",
        description:
          "There was an error uploading your file. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setCurrentFileName("");
    }
  };

  const handleUploadFolder = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleBrowserClick = () => {
    fileInputRef.current?.click();
    let fileName = currentFileName ? selectedFile?.name : currentFileName;
    if (!fileName) fileName = "";
    setCurrentFileName(fileName);
  };

  const desktopSidebar = () => {
    return (
      <div className="sidebar-container desktop-only">
        <div className="sidebar-items">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.name}
              className={`sidebar-item ${
                activeButton === tab.name ? "sidebar-active" : ""
              }`}
              name={tab.name}
              onClick={handleButtonClick}
            >
              <img
                src={tab.icon}
                alt={tab.label.toLowerCase()}
                className="sidebar-icon"
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-storage">
          <Progress value={usedStoragePercentage} />
          <p>
            {usedStorage} of {storage} used
          </p>
        </div>
        <div className="sidebar-footer">
          <h3>Drag and Drop</h3>
          <form onSubmit={handleUpload} ref={uploadForm}>
            <input
              id="file"
              name="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="sidebar-upload-button"
              required
            />
            <button type="submit" className="primary-btn">
              {isUploading ? <LoadingSpinner /> : "Upload"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const mobileSideBar = () => (
    <div className="mobile-sidebar mobile-only">
      <div className="sidebar-items">
        {sidebarTabs
          .filter((tab) => tab.name !== "recent" && tab.name !== "storage")
          .map((tab) => (
            <button
              key={tab.name}
              className={`sidebar-item ${
                activeButton === tab.name ? "sidebar-active" : ""
              }`}
              name={tab.name}
              onClick={handleButtonClick}
            >
              <img src={tab.icon} alt={tab.label} className="sidebar-icon" />
              <span>{tab.label}</span>
            </button>
          ))}
      </div>
      <button className="upload-btn-mobile" onClick={handleBrowserClick}>
        <FilePlus2 size={40} />
      </button>
      {selectedFile && (
        <div className="mobile-menu-overlay">
          <button className="x-icon" onClick={() => setSelectedFile(null)}>
            <X size={40} color="white" />
          </button>
          <div className="file-thumbnail">
            <File size={80} color="white" />
          </div>
          <div className="upload-options">
            <div>
              <legend>File Name</legend>
              <input
                type="text"
                name="file-name"
                id="file-name"
                value={currentFileName}
                onChange={(e) => setCurrentFileName(e.target.value)}
              />
            </div>
            <div className="button-div">
              <button onClick={() => fileInputRef.current?.click()}>
                Change File
              </button>
              <button onClick={handleUpload}>
                {isUploading ? <LoadingSpinner /> : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="sidebar-container">
      {mobileSideBar()}
      {desktopSidebar()}
    </div>
  );
};

const AdminSideBar = ({
  activeButton,
  setActiveButton,
  setNotification,
}: AdminSideBarProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

      formData.append("file", fileInput.files[0]);
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
        console.error(
          "Upload error:",
          error.message,
          "Field error",
          error.field
        );
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
          <img
            src="/icons/clock-regular.svg"
            alt="files"
            className="sidebar-icon"
          />
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
          <img
            src="/icons/users-solid.svg"
            alt="shared"
            className="sidebar-icon"
          />
          <span>File</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "settings" ? "sidebar-active" : ""
          }`}
          name="settings"
          onClick={handleButtonClick}
        >
          <img
            src="/icons/star-regular.svg"
            alt="starred"
            className="sidebar-icon"
          />
          <span>Settings</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "logs" ? "sidebar-active" : ""
          }`}
          name="logs"
          onClick={handleButtonClick}
        >
          <img
            src="/icons/trash-solid.svg"
            alt="trash"
            className="sidebar-icon"
          />
          <span>Logs</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "feedback" ? "sidebar-active" : ""
          }`}
          name="feedback"
          onClick={handleButtonClick}
        >
          <img
            src="/icons/cloud-solid.svg"
            alt="storage"
            className="sidebar-icon"
          />
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
              }
            }}
          />
          <button type="submit" className="primary-btn">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export { SideBar, AdminSideBar };
