'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground animate-in fade-in duration-500">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-20" />
                            <div className="relative bg-red-50 dark:bg-red-900/10 w-24 h-24 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">앗! 뭔가 잘못되었네요.</h1>
                            <p className="text-muted-foreground text-sm">
                                예기치 않은 오류가 발생했습니다.<br />
                                잠시 후 다시 시도하거나 페이지를 새로고침해주세요.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-left overflow-hidden">
                            <p className="text-xs font-mono text-muted-foreground break-all">
                                {this.state.error?.message || 'Unknown Error'}
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => this.setState({ hasError: false, error: null })} variant="outline">
                                다시 시도하기
                            </Button>
                            <Button onClick={this.handleReload} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                새로고침
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
