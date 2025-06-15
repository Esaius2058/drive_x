import { Link } from "react-router-dom";
import { act, useEffect, useState } from "react";
import { DashboardNavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { Progress } from "./Progress";
import { NoFiles, EmptyTrash, NoShared, NoStarred } from "./404";
import { useLocation } from "react-router-dom";
import { LoadingDashboard } from "./LoadingScreen";
import { useAuth } from "./AuthContext";

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
  const { user, files = [], userNames = {}, token, usedStorage: totalStorageUsed = 0 } = userFiles;
  
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

  const renderTable = () => (
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
            <td>{file.name}</td>
            <td>{userNames[file.user_id]}</td>
            <td>
              {decimalStorage
                ? decimalStorageConversion(Number(file.size))
                : binaryStorageConversion(Number(file.size))}
            </td>
            <td>{convertToLocaleString(file.updated_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSection = () => {
    switch (activeButton) {
      case "recent":
        return files.length === 0 ? <NoFiles /> : <>{renderTable()}</>;
      case "my-files":
        return files.length === 0 ? <NoFiles /> : <>{renderTable()}</>;
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
      <div className="dashboard-body">
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
        <div className="dashboard-content">{renderSection()}</div>
        {notification && (
          <div className={`toast-notification ${notification.type}`}>
            <p className="toast-title">{notification.message}</p>
            <p>{notification.description}</p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <LoadingDashboard />
  );
};

export { decimalStorageConversion, binaryStorageConversion, Dashboard };
