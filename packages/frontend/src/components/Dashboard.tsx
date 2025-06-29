import { act, useEffect, useState, useRef } from "react";
import { DashboardNavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { Progress } from "./Progress";
import { NoFiles, EmptyTrash, NoShared, NoStarred } from "./404";
import { useLocation } from "react-router-dom";
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
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleMenuAction = (action: string, fileId: string) => {
    setMenuOpen(null);
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
          {files.map((file: any) => (
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
                {menuOpen == file.id && (
                  <div className="dropdown-menu-file" ref={menuRef}>
                    <button onClick={() => handleMenuAction("open", file.id)}>
                      Open
                    </button>
                    <button onClick={() => handleMenuAction("rename", file.id)}>
                      Rename
                    </button>
                    <button onClick={() => handleMenuAction("share", file.id)}>
                      Share
                    </button>
                    <button onClick={() => handleMenuAction("delete", file.id)}>
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
      {files.map((file: any) => (
        <div key={file.id} className="file-item">
          <File size={50} />
          <div className="file-details">
            <div className="file-name">{file.name}</div>
            <div className="file-owner">
              {userNames[file.user_id]} -{" "}
              {convertToLocaleString(file.updated_at)}
            </div>
          </div>
          <button className="file-menu-btn" onClick={() => handleClickMenu(file.id)}>
            <EllipsisVertical size={15} />
          </button>
          {menuOpen == file.id && (
            <div className="dropdown-menu-file">
              <button onClick={() => handleMenuAction("open", file.id)}>
                Open
              </button>
              <button onClick={() => handleMenuAction("rename", file.id)}>
                Rename
              </button>
              <button onClick={() => handleMenuAction("share", file.id)}>
                Share
              </button>
              <button onClick={() => handleMenuAction("delete", file.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

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
        return <EmptyTrash />;
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
