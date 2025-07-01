
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
    
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. Our team has been notified about this error.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 p-4 rounded text-left text-sm font-mono overflow-auto max-h-40">
                  <div className="font-bold text-red-600 mb-2">Error Details:</div>
                  <div>{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <div className="mt-2 text-xs text-gray-600">
                      {this.state.error.stack}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReload} className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Page</span>
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                If this problem persists, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
