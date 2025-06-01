import { Link } from "react-router-dom";
import { act, useEffect, useState } from "react";
import { DashboardNavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { Progress } from "./Progress";
import { NoFiles, EmptyTrash, NoShared, NoStarred } from "./404";
import { useLocation } from "react-router-dom";
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

  const location = useLocation();
  const { userFiles } = location.state || {};

  const { files, userNames, token, usedStorage: totalStorageUsed } = userFiles;
  const { user } = useAuth();
  const name = `${userNames[user.id]}` || "John Doe";
  const email = `${user.email}` || "john324@gmail.com";
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

  const renderNotification = (notification: Notification) => {
    return (
      <div className={`toast-notification ${notification.type}`}>
        <p className="toast-title">{notification.message}</p>
        <p>{notification.description}</p>
      </div>
    );
  };

  const convertToLocaleString = (raw: string): string => {
    const date = new Date(raw);

    const formatted = date.toLocaleString();
    return formatted;
  }

  const renderSection = (activeButton: SidebarTab) => {
    switch (activeButton) {
      case "recent":
        return (
          <div id="recent-files" className="dashboard-section">
            {files.length == 0 ? (
              <NoFiles />
            ) : (
              <>
                <h2>Recent Files</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Modified</th>
                    </tr>
                  </thead>
                  {userFiles == null || undefined ? (
                    <tbody>
                      <tr>
                        <td>File 3</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                      <tr>
                        <td>File 4</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {/*
                      {folders.map((folder: any) => (
                        <tr key={folder.id}>
                          <td>{folderNames[folder.id]}</td>
                          <td>{folderNames[folder.parent_id] || "--"}</td>
                          <td>
                            {decimalStorage
                              ? decimalStorageConversion(Number(folder.size))
                              : binaryStorageConversion(Number(folder.size))}
                          </td>
                          <td>{userNames[folder.user_id]}</td>
                          <td>{folder.updated_at || folder.created_at}</td>
                        </tr>
                      ))}*/}
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
                  )}
                </table>
              </>
            )}
          </div>
        );
      case "my-files":
        return (
          <div id="my-files" className="dashboard-section">
            {files.length == 0 ? (
              <NoFiles />
            ) : (
              <>
                <h2>My Files</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Modified</th>
                    </tr>
                  </thead>
                  {userFiles == null || undefined ? (
                    <tbody>
                      <tr>
                        <td>File 3</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                      <tr>
                        <td>File 4</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {/*{folders.map((folder: any) => (
                        <tr key={folder.id}>
                          <td>{folderNames[folder.id]}</td>
                          <td>{folderNames[folder.parent_id] || "--"}</td>
                          <td>
                            {decimalStorage
                              ? decimalStorageConversion(Number(folder.size))
                              : binaryStorageConversion(Number(folder.size))}
                          </td>
                          <td>{userNames[folder.user_id]}</td>
                          <td>{folder.updated_at || folder.created_at}</td>
                        </tr>
                      ))}*/}
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
                  )}
                </table>
              </>
            )}
          </div>
        );
      case "shared":
        return (
          <div id="shared" className="dashboard-section">
            {files.length == 0 ? (
              <NoShared />
            ) : (
              <>
                <h2>Shared With Me</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Last Modified</th>
                    </tr>
                  </thead>
                  {userFiles == null || undefined ? (
                    <tbody>
                      <tr>
                        <td>File 3</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                      <tr>
                        <td>File 4</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {/*{folders.map((folder: any) => (
                        <tr key={folder.id}>
                          <td>{folderNames[folder.id]}</td>
                          <td>{folderNames[folder.parent_id] || "--"}</td>
                          <td>
                            {decimalStorage
                              ? decimalStorageConversion(Number(folder.size))
                              : binaryStorageConversion(Number(folder.size))}
                          </td>
                          <td>{userNames[folder.user_id]}</td>
                          <td>{folder.updated_at || folder.created_at}</td>
                        </tr>
                      ))}*/}
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
                  )}
                </table>
              </>
            )}
          </div>
        );
      case "storage":
        return (
          <div id="storage" className="dashboard-section">
            <h2>Storage</h2>
            <div className="storage-info">
              <p>Total Storage: {storage}</p>
              <p>Used Storage: {usedStorage}</p>
              <p>Used Storage Percentage: {usedStoragePercentage}%</p>
            </div>
            <Progress value={usedStoragePercentage} />
          </div>
        );
      case "starred":
        return (
          <div id="starred" className="dashboard-section">
            {files.length == 0 ? (
              <NoStarred />
            ) : (
              <>
                <h2>Starred Files</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Modified</th>
                    </tr>
                  </thead>
                  {userFiles == null || undefined ? (
                    <tbody>
                      <tr>
                        <td>File 3</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                      <tr>
                        <td>File 4</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {/*{folders.map((folder: any) => (
                        <tr key={folder.id}>
                          <td>{folderNames[folder.id]}</td>
                          <td>{folderNames[folder.parent_id] || "--"}</td>
                          <td>
                            {decimalStorage
                              ? decimalStorageConversion(Number(folder.size))
                              : binaryStorageConversion(Number(folder.size))}
                          </td>
                          <td>{userNames[folder.user_id]}</td>
                          <td>{folder.updated_at || folder.created_at}</td>
                        </tr>
                      ))}*/}
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
                  )}
                </table>
              </>
            )}
          </div>
        );
      case "trash":
        return (
          <div id="trash" className="dashboard-section">
            {files.length == 0 ? (
              <EmptyTrash />
            ) : (
              <>
                <h2>Trash</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Modified</th>
                    </tr>
                  </thead>
                  {userFiles == null || undefined ? (
                    <tbody>
                      <tr>
                        <td>File 3</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                      <tr>
                        <td>File 4</td>
                        <td>100</td>
                        <td>John Doe</td>
                        <td>2021-01-01</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {/*Render folders first*/}
                      {/*{folders.map((folder: any) => (
                        <tr key={folder.id}>
                          <td>{folderNames[folder.id]}</td>
                          <td>{folderNames[folder.parent_id] || "--"}</td>
                          <td>
                            {decimalStorage
                              ? decimalStorageConversion(Number(folder.size))
                              : binaryStorageConversion(Number(folder.size))}
                          </td>
                          <td>{userNames[folder.user_id]}</td>
                          <td>{folder.updated_at || folder.created_at}</td>
                        </tr>
                      ))}*/}
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
                  )}
                </table>
              </>
            )}
          </div>
        );
    }
  };
  return (
    <div className="dashboard-page">
      {notification && renderNotification(notification)}
      <DashboardNavBar
        name={name}
        email={email}
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
          setusedStorage={usedStorage}
          storage={storage}
          usedStoragePercentage={usedStoragePercentage}
          setNotification={setNotification}
          token={token}
        />
        <div className="dashboard-content">
          {/*Dynamically Render Content*/ renderSection(activeButton)}
        </div>
      </div>
    </div>
  );
};

export { decimalStorageConversion, binaryStorageConversion, Dashboard };
