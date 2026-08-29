import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Application:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F5EE] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#FDFCF8] border border-[#E6E2D3] p-8 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 bg-[#F9E8E8] text-[#8C2B2B] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-lg font-black text-[#4A453E]">Application Error Detected</h1>
            <p className="text-xs text-[#787267] leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred while rendering the application.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-[#2E5B50] text-white font-bold rounded-2xl text-xs hover:bg-[#254A41] transition"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 bg-[#EFECE1] text-[#787267] font-bold rounded-2xl text-xs hover:bg-[#E6E2D3] transition"
              >
                Reset App Cache & Clear Storage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

