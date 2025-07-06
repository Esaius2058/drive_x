import { act, useEffect, useState, useRef } from "react";
import { DashboardNavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { Progress } from "./Progress";
import { NoFiles, EmptyTrash, NoShared, NoStarred } from "./404";
import { useLocation } from "react-router-dom";
import { getFile, moveToTrash, updateFile } from "../services/file";
import { LoadingDashboard } from "./LoadingScreen";
import { useAuth } from "./AuthContext";
import { File, EllipsisVertical } from "lucide-react";

const binaryStorageConversion = (bytes: number) => {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  const tb = gb / 1024;

  if (tb >= 1) return `${tb.toFixed(2)} TB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  if (kb >= 1) return `${kb.toFixed(2)} KB`;
  return `${bytes} bytes`;
};

const decimalStorageConversion = (bytes: number) => {
  const kb = bytes / 1000;
  const mb = kb / 1000;
  const gb = mb / 1000;
  const tb = gb / 1000;

  if (tb >= 1) return `${tb.toFixed(2)} TB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  if (kb >= 1) return `${kb.toFixed(2)} KB`;
  return `${bytes} bytes`;
};

const Dashboard = () => {
  const sidebarTabs = [
    { name: "recent", label: "Recent Files", icon: "/clock-regular.svg" },
    { name: "my-files", label: "My Files", icon: "/folder-closed-regular.svg" },
    { name: "shared", label: "Shared with me", icon: "/users-solid.svg" },
    { name: "trash", label: "Trash", icon: "/trash-solid.svg" },
    { name: "storage", label: "Storage", icon: "/cloud-solid.svg" },
    { name: "starred", label: "Starred", icon: "/starred-regular.svg" },
  ] as const;

  interface Notification {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    description?: string; // milliseconds
  }

  const { userFiles } = useAuth();
  const {
    user,
    files = [],
    userNames = {},
    token,
    usedStorage: totalStorageUsed = 0,
  } = userFiles;

  const name = "John Doe";
  const email = "john324@gmail.com";
  const avatarUrl = ``;

  type SidebarTab = (typeof sidebarTabs)[number]["name"];

  const [activeButton, setActiveButton] = useState<SidebarTab>("recent");
  const [storage, setStorage] = useState<string>("1 GB");
  const [usedStorage, setUsedStorage] = useState<string>("0 KB");
  const [usedStoragePercentage, setUsedStoragePercentage] = useState<number>(0);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [decimalStorage, setDecimalStorage] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [currentFileId, setCurrentFileId] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (totalStorageUsed == null) return;

    if (decimalStorage) {
      setUsedStorage(decimalStorageConversion(totalStorageUsed));
    } else {
      setUsedStorage(binaryStorageConversion(totalStorageUsed));
    }

    const totalStorage = 1 * 1024 * 1024 * 1024; // 1 GB in bytes
    const usedStoragePercentageValue = Math.min(
      parseFloat(((totalStorageUsed / totalStorage) * 100).toFixed(3)),
      100
    );

    setUsedStoragePercentage(usedStoragePercentageValue);

    if (notification) {
      const timeout = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timeout); // Clean up on unmount or change
    }
  }, [totalStorageUsed, decimalStorage, notification]);

  const convertToLocaleString = (raw: string): string => {
    const date = new Date(raw);

    const formatted = date.toLocaleString();
    return formatted;
  };

  const handleClickMenu = (fileId: string) => {
    setMenuOpen(menuOpen == fileId ? null : fileId);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleMoveToTrash = async (fileId: string) => {
    try {
      const message = await moveToTrash(fileId);
      setNotification({
        message,
        type: "success",
      });
    } catch (error: any) {
      setNotification({
        message: "Error moving file to trash",
        type: "error",
        description: error.message,
      });
    }
  };

  const handleMenuAction = async (
    action: string,
    fileId: string,
    fileName: string
  ) => {
    setCurrentFileId(fileId);
    switch (action) {
      case "open":
        const url = await getFile(fileId);
        window.open(url, "_blank");
        break;

      case "rename":
        setCurrentFileName(fileName);
        setRenameOpen(true);
        break;

      case "delete":
        await handleMoveToTrash(fileId);
        break;

      case "share":
        break;
    }
    setMenuOpen(null);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = renameForm.current;
    if (!form) {
      setNotification({ message: "Form is not available." });
      return;
    }

    try {
      const formData = new FormData(form);

      const newName = formData.get("newname") as string;

      const message = await updateFile(currentFileId, newName);
      setNotification({
        message,
        type: "success",
      });
    } catch (error: any) {
      console.error("Rename failed:", error);
      setNotification({
        message: "Error renaming file",
        type: "error",
        description: error,
      });
    } finally {
      setRenameOpen(false);
    }
  };

  const renderDesktopTable = () => (
    <div className="file-table desktop-only">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Size</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {files
            .filter((file: any) => !file.is_deleted)
            .map((file: any) => (
              <tr key={file.id}>
                <td className="filename-cell">{file.name}</td>
                <td className="filename-cell">{userNames[file.user_id]}</td>
                <td>
                  {decimalStorage
                    ? decimalStorageConversion(Number(file.size))
                    : binaryStorageConversion(Number(file.size))}
                </td>
                <td className="filename-cell">
                  {convertToLocaleString(file.updated_at)}
                </td>
                <td>
                  <button
                    className="file-menu-btn"
                    onClick={() => handleClickMenu(file.id)}
                    aria-label={`Menu for ${file.name}`}
                  >
                    <EllipsisVertical size={15} />
                  </button>
                  {menuOpen === file.id && (
                    <div className="dropdown-menu-file" ref={menuRef}>
                      <button
                        onClick={() =>
                          handleMenuAction("open", file.id, file.name)
                        }
                      >
                        Open
                      </button>
                      <button
                        onClick={() =>
                          handleMenuAction("rename", file.id, file.name)
                        }
                      >
                        Rename
                      </button>
                      <button
                        onClick={() =>
                          handleMenuAction("share", file.id, file.name)
                        }
                      >
                        Share
                      </button>
                      <button
                        onClick={() =>
                          handleMenuAction("delete", file.id, file.name)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  //file table for mobile
  const renderMobileTable = () => (
    <div className="file-table mobile-only">
      {files
        .filter((file: any) => !file.is_deleted)
        .map((file: any) => (
          <div key={file.id} className="file-item">
            <File size={50} />
            <div className="file-details">
              <div className="file-name">{file.name}</div>
              <div className="file-owner">
                {userNames[file.user_id]} -{" "}
                {convertToLocaleString(file.updated_at)}
              </div>
            </div>
            <button
              className="file-menu-btn"
              onClick={() => handleClickMenu(file.id)}
            >
              <EllipsisVertical size={15} />
            </button>
            {menuOpen == file.id && (
              <div className="dropdown-menu-file">
                <button
                  onClick={() => handleMenuAction("open", file.id, file.name)}
                >
                  Open
                </button>
                <button
                  onClick={() => handleMenuAction("rename", file.id, file.name)}
                >
                  Rename
                </button>
                <button
                  onClick={() => handleMenuAction("share", file.id, file.name)}
                >
                  Share
                </button>
                <button
                  onClick={() => handleMenuAction("delete", file.id, file.name)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );

  const renderTrashList = () => {
    return files
      .filter((file: any) => file.is_deleted)
      .map((file: any) => (
        <div key={file.id} className="file-item">
          <File size={50} />
          <div className="file-details">
            <div className="file-name">{file.name}</div>
            <div className="file-owner">
              {userNames[file.user_id]} -{" "}
              {convertToLocaleString(file.updated_at)}
            </div>
          </div>
          <button
            className="file-menu-btn"
            onClick={() => handleClickMenu(file.id)}
          >
            <EllipsisVertical size={15} />
          </button>
          {menuOpen === file.id && (
            <div className="dropdown-menu-file">
              <button
                onClick={() => handleMenuAction("open", file.id, file.name)}
              >
                Open
              </button>
              <button
                onClick={() => handleMenuAction("rename", file.id, file.name)}
              >
                Rename
              </button>
              <button
                onClick={() => handleMenuAction("share", file.id, file.name)}
              >
                Share
              </button>
              <button
                onClick={() => handleMenuAction("delete", file.id, file.name)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ));
  };

  const renderList = () => {
    switch (activeButton) {
      case "recent":
        return files.length === 0 ? (
          <NoFiles />
        ) : (
          <>
            {renderDesktopTable()}
            {renderMobileTable()}
          </>
        );
      case "my-files":
        return files.length === 0 ? (
          <NoFiles />
        ) : (
          <>
            {renderDesktopTable()}
            {renderMobileTable()}
          </>
        );
      case "shared":
        return <NoShared />;
      case "trash":
        const trashedFiles = files.filter(
          (file: any) => file.is_deleted === true
        );
        return trashedFiles.length === 0 ? <EmptyTrash /> : renderTrashList();
      case "starred":
        return <NoStarred />;
      case "storage":
        return (
          <div>
            <p>Total: {storage}</p>
            <p>Used: {usedStorage}</p>
            <p>{usedStoragePercentage}%</p>
            <Progress value={usedStoragePercentage} />
          </div>
        );
      default:
        return null;
    }
  };

  const desktopDashbody = () => {
    return (
      <div className="dashboard-body desktop-only">
        <SideBar
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          usedStorage={usedStorage}
          setusedStorage={setUsedStorage}
          storage={storage}
          usedStoragePercentage={usedStoragePercentage}
          setNotification={setNotification}
          token={token}
        />
        <div className="dashboard-content">{renderList()}</div>
        {notification && (
          <div className={`toast-notification ${notification.type}`}>
            <p className="toast-title">{notification.message}</p>
            <p>{notification.description}</p>
          </div>
        )}
        {renameOpen && (
          <form
            ref={renameForm}
            onSubmit={handleRename}
            className="rename-form"
          >
            <h2>Rename</h2>
            <input
              type="text"
              name="newname"
              value={currentFileName}
              onChange={(e) => setCurrentFileName(e.target.value)}
            />
            <div className="button-div">
              <button type="submit" className="primary-btn">
                Rename
              </button>
              <button
                className="secondary-btn"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  const mobileDashbody = () => {
    return (
      <div className="dashboard-body mobile-only">
        <div className="dashboard-content">{renderList()}</div>
        <SideBar
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          usedStorage={usedStorage}
          setusedStorage={setUsedStorage}
          storage={storage}
          usedStoragePercentage={usedStoragePercentage}
          setNotification={setNotification}
          token={token}
        />
        {notification && (
          <div className={`toast-notification ${notification.type}`}>
            <p className="toast-title">{notification.message}</p>
            <p>{notification.description}</p>
          </div>
        )}
        {renameOpen && (
          <form
            ref={renameForm}
            onSubmit={handleRename}
            className="rename-form"
          >
            <h2>Rename</h2>
            <input
              type="text"
              name="newname"
              value={currentFileName}
              onChange={(e) => setCurrentFileName(e.target.value)}
            />
            <div className="button-div">
              <button type="submit" className="primary-btn">
                Rename
              </button>
              <button
                className="secondary-btn"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return user ? (
    <div className="dashboard-page">
      <DashboardNavBar
        name={userNames[user.id] || name}
        email={user.email || email}
        usedStoragePercentage={usedStoragePercentage}
        avatarUrl={avatarUrl}
        notification={notification}
        setNotification={setNotification}
        files={files}
        userNames={userNames}
        decimalStorage={decimalStorage}
        setDecimalStorage={setDecimalStorage}
        binaryStorageConversion={binaryStorageConversion}
        decimalStorageConversion={decimalStorageConversion}
      />
      {mobileDashbody()}
      {desktopDashbody()}
    </div>
  ) : (
    <LoadingDashboard />
  );
};

export { decimalStorageConversion, binaryStorageConversion, Dashboard };
