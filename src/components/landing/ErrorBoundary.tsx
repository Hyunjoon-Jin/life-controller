'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-[500px] flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[40px] text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
                    <p className="text-slate-500 mb-6">데모를 불러오는 중 문제가 발생했습니다.</p>
                    <Button onClick={() => this.setState({ hasError: false })} variant="outline">
                        Try details
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
