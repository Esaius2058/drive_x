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

export default LoadingDashboard;