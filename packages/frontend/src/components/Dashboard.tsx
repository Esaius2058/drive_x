import { Link } from "react-router-dom";
import { act, useEffect, useState } from "react";
import { DashboardNavBar } from "./NavBar";
import SideBar from "./SideBar";
import { Progress } from "./Progress";

const Dashboard = ({ userData }: any) => {
  const sidebarTabs = [
    { name: "recent", label: "Recent Files", icon: "/clock-regular.svg" },
    { name: "my-files", label: "My Files", icon: "/folder-closed-regular.svg" },
    { name: "shared", label: "Shared with me", icon: "/users-solid.svg" },
    { name: "trash", label: "Trash", icon: "/trash-solid.svg" },
    { name: "storage", label: "Storage", icon: "/cloud-solid.svg" },
    { name: "starred", label: "Starred", icon: "/starred-regular.svg" },
  ] as const;
  const { folderNames, folders, files, user, userNames} = userData;
  const name = `${userNames[user.id]}` || "John Doe";
  const email = `${user.email}` || "john324@gmail.com";
  const avatarUrl = ``;
  

  type SidebarTab = (typeof sidebarTabs)[number]["name"];

  const [activeButton, setActiveButton] = useState<SidebarTab>("recent");
  const [storage, setStorage] = useState<number>(0);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [usedStoragePercentage, setUsedStoragePercentage] = useState<number>(0);

  const renderSection = (activeButton: SidebarTab) => {
    switch (activeButton) {
      case "recent":
        return (
          <div id="recent-files" className="dashboard-section">
            <h2>Recent Files</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parent Folder</th>
                  <th>File Size</th>
                  <th>Owner</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>File 1</td>
                  <td>Folder 1</td>
                  <td>100</td>
                  <td>User 1</td>
                  <td>2021-01-01</td>
                </tr>
                <tr>
                  <td>File 2</td>
                  <td>Folder 2</td>
                  <td>200</td>
                  <td>User 2</td>
                  <td>2021-01-02</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "my-files":
        return (
          <div id="my-files" className="dashboard-section">
            <h2>My Files</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parent Folder</th>
                  <th>Size</th>
                  <th>Owner</th>
                  <th>Modified</th>
                </tr>
              </thead>
              {userData == null || undefined ? (
                <tbody>
                  <tr>
                    <td>File 3</td>
                    <td>File</td>
                    <td>100</td>
                    <td>Folder 1</td>
                    <td>2021-01-01</td>
                  </tr>
                  <tr>
                    <td>File 4</td>
                    <td>File</td>
                    <td>100</td>
                    <td>Folder 1</td>
                    <td>2021-01-01</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {/*Render folders first*/}
                  {folders.map((folder: any) => (
                    <tr key={folder.id}>
                      <td>{folderNames[folder.id]}</td>
                      <td>{folderNames[folder.parent_id] || "--"}</td>
                      <td>{folder.size}</td>
                      <td>{userNames[folder.user_id]}</td>
                      <td>{folder.updated_at || folder.created_at}</td>
                    </tr>
                  ))}+
                  {
                    files.map((file: any) => (
                      <tr key={file.id}>
                        <td>{file.name}</td>
                        <td>--</td>
                        <td>{file.size}</td>
                        <td>{userNames[file.user_id]}</td>
                        <td>{file.updated_at}</td>
                      </tr>
                    ))
                  }
                </tbody>
              )}
            </table>
          </div>
        );
      case "shared":
        return (
          <div id="shared" className="dashboard-section">
            <h2>Shared With Me</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parent Folder</th>
                  <th>File Size</th>
                  <th>Owner</th>
                  <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>File 3</td>
                  <td>File</td>
                  <td>100</td>
                  <td>Folder 1</td>
                  <td>2021-01-01</td>
                </tr>
                <tr>
                  <td>File 4</td>
                  <td>File</td>
                  <td>100</td>
                  <td>Folder 1</td>
                  <td>2021-01-01</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "storage":
        return (
          <div id="storage" className="dashboard-section">
            <h2>Storage</h2>
            <div className="storage-info">
              <p>Total Storage: {storage} GB</p>
              <p>Used Storage: {usedStorage} GB</p>
              <p>Used Storage Percentage: {usedStoragePercentage}%</p>
            </div>
            <Progress value={17} />
          </div>
        );
      case "starred":
        return (
          <div id="starred" className="dashboard-section">
            <h2>Starred</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parent Folder</th>
                  <th>File Size</th>
                  <th>Owner</th>
                  <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>File 3</td>
                  <td>File</td>
                  <td>100</td>
                  <td>Folder 1</td>
                  <td>2021-01-01</td>
                </tr>
                <tr>
                  <td>File 4</td>
                  <td>File</td>
                  <td>100</td>
                  <td>Folder 1</td>
                  <td>2021-01-01</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "trash":
        return (
          <div id="trash" className="dashboard-section">
            <h2>Trash</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parent Folder</th>
                  <th>File Size</th>
                  <th>Owner</th>
                  <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>File 3</td>
                  <td>File</td>
                  <td>100</td>
                  <td>Folder 1</td>
                  <td>2021-01-01</td>
                </tr>
                <tr>
                  <td>File 4</td>
                  <td>File</td>
                  <td>100</td>
                  <td>Folder 1</td>
                  <td>2021-01-01</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
    }
  };
  return (
    <div className="dashboard-page">
      <DashboardNavBar
        name={name}
        email={email}
        usedStoragePercentage={usedStoragePercentage}
        avatarUrl={avatarUrl}
      />
      <div className="dashboard-body">
        <SideBar
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          usedStorage={usedStorage}
          setusedStorage={usedStorage}
          storage={storage}
          usedStoragePercentage={usedStoragePercentage}
        />
        <div className="dashboard-content">
          {/*Dynamically Render Content*/ renderSection(activeButton)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
