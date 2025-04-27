import { Link } from "react-router-dom";
import { Progress } from "./Progress";

type SideBarTab =
  | "recent"
  | "my-files"
  | "shared"
  | "trash"
  | "storage"
  | "starred";
type SideBarProps = {
  activeButton: SideBarTab;
  setActiveButton: React.Dispatch<React.SetStateAction<SideBarTab>>;
  usedStorage: number;
  setusedStorage: number;
  storage: number;
  usedStoragePercentage: number;
};

const SideBar = ({
  activeButton,
  setActiveButton,
  usedStorage,
  storage,
  usedStoragePercentage,
}: SideBarProps) => {
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = event.currentTarget.name;
    setActiveButton(buttonName as SideBarTab);
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
        <input type="file" className="sidebar-upload-button" />
      </div>
    </div>
  );
};

export default SideBar;
