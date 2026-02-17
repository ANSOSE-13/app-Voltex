import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong 😢</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        The application encountered an error. Please try refreshing the page.
                    </p>
                    <details className="text-xs bg-white dark:bg-gray-800 p-4 rounded-lg overflow-auto border border-gray-200 dark:border-gray-700 font-mono text-red-500">
                        {this.state.error?.toString()}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
