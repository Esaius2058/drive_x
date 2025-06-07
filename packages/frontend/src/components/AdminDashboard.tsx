import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useLocation } from "react-router-dom";
import { AdminNavBar } from "./NavBar";
import { AdminSideBar } from "./SideBar";
import { decimalStorageConversion, binaryStorageConversion } from "./Dashboard";

interface UsersTableProps {
  user: any;
  allUsers: any;
  userNames: any;
  decimalStorage: boolean;
  decimalStorageConversion: (bytes: number) => string;
  binaryStorageConversion: (bytes: number) => string;
}

const UsersTable = ({
  user,
  allUsers,
  decimalStorage,
  decimalStorageConversion,
  binaryStorageConversion,
}: UsersTableProps) => {
  return (
    <table className="subsection-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Storage Used</th>
        </tr>
      </thead>
      <tbody>
        {allUsers.map((user: any) => (
          <tr key={user.email}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
            {/* Assuming user.storageUsed is a number */}
            <td>
              {decimalStorage
                ? decimalStorageConversion(user.storageUsed)
                : binaryStorageConversion(user.storageUsed)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const AdminDashboard = () => {
  const sidebarTabs = [
    { name: "overview", label: "Overview", icon: "/clock-regular.svg" },
    { name: "users", label: "Users", icon: "/folder-closed-regular.svg" },
    { name: "files", label: "Files", icon: "/users-solid.svg" },
    { name: "settings", label: "Settings", icon: "/trash-solid.svg" },
    { name: "logs", label: "Logs", icon: "/cloud-solid.svg" },
    { name: "feedback", label: "Feedback", icon: "/starred-regular.svg" },
  ] as const;

  type AdminSidebarTab = (typeof sidebarTabs)[number]["name"];
  interface Notification {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    description?: string; 
  }

  const [notification, setNotification] = useState<Notification | null>(null);
  const [decimalStorage, setDecimalStorage] = useState<boolean>(true);
  const [activeButton, setActiveButton] = useState<AdminSidebarTab>("overview");
  const [subsection, setSubsection] = useState<string>("all-users");

  const location = useLocation();
  const { userFiles } = location.state || {};
  const { user } = useAuth();
  const {
    userNames,
    userCount,
    fileCount,
    usedStorage,
    activityLogs,
    allUsers,
    allFiles,
  } = userFiles;
  const name = `${userNames[user.id]}` || "John Doe";
  const email = `${user.email}` || "john324@gmail.com";
  const avatarUrl = ``;

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = e.currentTarget.name;
    setSubsection(buttonName);
  };

  const renderSubsection = (subsection: string) => {
    switch (subsection) {
      case "all-users":
        return (
          <div className="dashboard-subsection">
            <h3>Users</h3>
            <UsersTable
              user={ user }
              allUsers={allUsers}
              userNames={userNames}
              decimalStorage={decimalStorage}
              decimalStorageConversion={decimalStorageConversion}
              binaryStorageConversion={binaryStorageConversion}
            />
          </div>
        );

      case "activity-logs":
        return (
          <div className="dashboard-subsection">
            <h3>Activity Logs</h3>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User Name</th>
                  <th>User Id</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td>File {log.action}</td>
                    <td>{userNames[log.user_id]}</td>
                    <td>{log.user_id}</td>
                    <td>{new Date(log.inserted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  const renderSection = (activeButton: AdminSidebarTab) => {
    switch (activeButton) {
      case "overview":
        return (
          <div className="dashboard-section">
            <div>
              <h3>Total Files Uploaded: {fileCount}</h3>
              <h3>Storage Usage: {usedStorage}</h3>
              <h3>User Count: {userCount}</h3>
              <h3>Top Uploaders</h3>
              <h3>Recent Activity Feed</h3>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="dashboard-section">
            <div className="subsection-options">
              <button
                className="secondary-btn"
                name="all-users"
                onClick={handleButtonClick}
              >
                All Users
              </button>
              <button
                className="secondary-btn"
                name="activity-logs"
                onClick={handleButtonClick}
              >
                Activity Logs
              </button>
              <button
                className="secondary-btn"
                name="role-assignment"
                onClick={handleButtonClick}
              >
                Role Assignment
              </button>
            </div>
            {renderSubsection(subsection)}
          </div>
        );
      case "files":
        return <div className="dashboard-section"></div>;
      case "settings":
        return <div className="dashboard-section"></div>;
      case "logs":
        return <div className="dashboard-section"></div>;
      case "feedback":
        return <div className="dashboard-section"></div>;
    }
  };

  return (
    <div className="dashboard-page">
      <AdminNavBar
        name={name}
        email={email}
        avatarUrl={avatarUrl}
        notification={notification}
        setNotification={setNotification}
        decimalStorage={decimalStorage}
        setDecimalStorage={setDecimalStorage}
      />
      <div className="dashboard-body">
        <AdminSideBar
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          setNotification={setNotification}
        />
        <div className="dashboard-content">{renderSection(activeButton)}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
