/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors from Voxel theme's global scripts
 * that interfere with the Timeline block in the Gutenberg editor.
 * 
 * @package VoxelFSE
 */

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Timeline ErrorBoundary caught an error:', error, errorInfo);
    }

    override render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h3>Timeline Block</h3>
                    <p>The Timeline block is currently experiencing a compatibility issue with Voxel theme scripts in the editor.</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                        The block will work correctly on the frontend. Error: {this.state.error?.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
