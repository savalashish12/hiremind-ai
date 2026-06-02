import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col justify-center items-center p-10 text-white text-center">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md shadow-2xl">
            <span className="text-5xl block mb-4">⚠️</span>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">
              The application encountered an unexpected error. Don't worry, your database records are safe.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              Reload Page 🔄
            </button>
            {this.state.error && (
              <pre className="mt-6 text-left text-xs bg-slate-900 p-4 rounded-lg overflow-auto text-red-400 max-h-40">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
