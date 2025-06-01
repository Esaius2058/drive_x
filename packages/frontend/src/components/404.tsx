import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/dashboard");
  };
  return (
    <div className="error-page">
      <h1>404</h1>
      <h2>The page you're looking for doesn't exist.</h2>
      <button className="primary-btn" onClick={() => handleRedirect()}>
        Back to Dashboard
      </button>
    </div>
  );
};

const NoFiles = () => {
  return (
    <div className="no-section">
      <h1>No files here</h1>
      <h2>It seems you don't have any files yet.</h2>
      <button className="primary-btn">Upload Files</button>
    </div>
  );
};

const EmptyTrash = () => {
  return (
    <div className="no-section">
      <h1>Trash is empty</h1>
      <h2>Looks like you haven't deleted anything yet.</h2>
    </div>
  );
};

const NoStarred = () => {
  return (
    <div className="no-section">
      <h1>No starred files</h1>
      <h2>Looks like you haven't starred any files yet.</h2>
    </div>
  );
};

const NoShared = () => {
  return (
    <div className="no-section">
      <h1>No shared files</h1>
      <h2>Looks like you haven't shared any files yet.</h2>
    </div>
  );
};

const ErrorFallBack = () => {
  return <div>Something broke. Try refreshing.</div>;
};

export { ErrorPage, ErrorFallBack, NoFiles, EmptyTrash, NoStarred, NoShared };
