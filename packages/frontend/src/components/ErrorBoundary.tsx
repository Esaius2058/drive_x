import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  navigate?: (path: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  handleRedirect = () => {
    this.props.navigate?.("/auth/login");
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1 className="text-xl font-bold">Something went wrong.</h1>
          <h2>{this.state.error?.message}</h2>
          <button className="primary-btn" onClick={this.handleRedirect}>
            To Log In
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundaryWrapper(props: Props) {
  const navigate = useNavigate();

  return <ErrorBoundary {...props} navigate={navigate}/>
}