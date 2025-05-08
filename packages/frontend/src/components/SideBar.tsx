import { Link } from "react-router-dom";
import { Progress } from "./Progress";
import { useRef } from "react";
import { uploadSingleFile } from "../services/upload";

type SideBarTab =
  | "recent"
  | "my-files"
  | "shared"
  | "trash"
  | "storage"
  | "starred";

interface Notification {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // milliseconds
}

type SideBarProps = {
  token: string;
  activeButton: SideBarTab;
  setActiveButton: React.Dispatch<React.SetStateAction<SideBarTab>>;
  usedStorage: number;
  setusedStorage: number;
  storage: number;
  usedStoragePercentage: number;
  setNotification: React.Dispatch<React.SetStateAction<Notification>>;
};

const SideBar = ({
  activeButton,
  setActiveButton,
  usedStorage,
  storage,
  usedStoragePercentage,
  setNotification
}: SideBarProps) => {
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = event.currentTarget.name;
    setActiveButton(buttonName as SideBarTab);
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
            activeButton === "recent" ? "sidebar-active" : ""
          }`}
          name="recent"
          onClick={handleButtonClick}
        >
          <img src="/clock-regular.svg" alt="files" className="sidebar-icon" />
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
            src="/folder-closed-regular.svg"
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
          <img src="/users-solid.svg" alt="shared" className="sidebar-icon" />
          <span>Shared with me</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "starred" ? "sidebar-active" : ""
          }`}
          name="starred"
          onClick={handleButtonClick}
        >
          <img src="/star-regular.svg" alt="starred" className="sidebar-icon" />
          <span>Starred</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "trash" ? "sidebar-active" : ""
          }`}
          name="trash"
          onClick={handleButtonClick}
        >
          <img src="/trash-solid.svg" alt="trash" className="sidebar-icon" />
          <span>Trash</span>
        </button>
        <button
          className={`sidebar-item ${
            activeButton === "storage" ? "sidebar-active" : ""
          }`}
          name="storage"
          onClick={handleButtonClick}
        >
          <img src="/cloud-solid.svg" alt="storage" className="sidebar-icon" />
          <span>Storage</span>
        </button>
        <div className="sidebar-storage">
          <Progress value={17} />
          <p>
            {usedStorage} GB of {storage} GB used
          </p>
        </div>
      </div>
      <div className="sidebar-footer">
        <h3>Drag and Drop</h3>
        <form onSubmit={handleUpload} ref={uploadForm}>
          <input
            type="file"
            className="sidebar-upload-button"
            id="file"
            name="file"
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

export default SideBar;
