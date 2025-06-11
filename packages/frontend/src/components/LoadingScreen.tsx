const LoadingDashboard = () => {
  return (
    <div className="skeleton-page">
        <div className="skeleton-header">
            <div className="skeleton skeleton-avatar"></div>
        </div>
        <div className="skeleton-body">
            <div className="skeleton-sidebar">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
            </div>
            <div className="skeleton skeleton-content"></div>
        </div>            
    </div>
  );
}

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
}

export {LoadingDashboard, LoadingSpinner};