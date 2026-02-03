'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Person } from '@/types';
import { useData } from '@/context/DataProvider';
import { Search, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import ForceGraph2D with no SSR as it depends on window/canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-muted-foreground">Loading Map...</div>
});

interface PeopleMapProps {
    onClose: () => void;
}

export function PeopleMap({ onClose }: PeopleMapProps) {
    const { people } = useData();
    const graphRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Process Data into Graph Format
    const graphData = useMemo(() => {
        const nodes = people.map(p => ({
            ...p,
            val: (p.tags?.length || 0) + 1, // Node size
            group: p.relationship
        }));

        const links: any[] = [];

        // Simple algorithm to find connections based on shared tags
        for (let i = 0; i < people.length; i++) {
            for (let j = i + 1; j < people.length; j++) {
                const p1 = people[i];
                const p2 = people[j];

                if (!p1.tags || !p2.tags) continue;

                // Find intersection of tags
                const sharedTags = p1.tags.filter(tag => p2.tags?.includes(tag));

                if (sharedTags.length > 0) {
                    links.push({
                        source: p1.id,
                        target: p2.id,
                        value: sharedTags.length, // Strength/Width of link
                        commonTags: sharedTags
                    });
                }
            }
        }

        return { nodes, links };
    }, [people]);

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-bold">인맥 지도 (People Map)</h2>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-4">
                        * 같은 태그를 가진 사람들끼리 연결됩니다.
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Graph Container */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-black/5 dark:bg-black/20">
                {people.length < 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        인맥 데이터가 부족하여 지도를 생성할 수 없습니다. (최소 2명 이상, 태그 입력 필요)
                    </div>
                ) : (
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel="name"
                        nodeColor={node => {
                            switch ((node as any).group) {
                                case 'family': return '#818cf8'; // Indigo
                                case 'friend': return '#4ade80'; // Green
                                case 'work': return '#60a5fa'; // Blue
                                default: return '#9ca3af'; // Gray
                            }
                        }}
                        nodeRelSize={6}
                        linkColor={() => '#cbd5e1'} // Light gray links
                        linkWidth={link => Math.sqrt((link as any).value) * 2} // Thicker lines for more shared tags
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={d => (d as any).value * 0.001}
                        // Custom Render for Nodes to show names
                        nodeCanvasObject={(node: any, ctx, globalScale) => {

                            const label = node.name;
                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Sans-Serif`;
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            if (node.group === 'family') ctx.fillStyle = 'rgba(129, 140, 248, 0.2)';
                            if (node.group === 'friend') ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
                            if (node.group === 'work') ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';

                            ctx.beginPath();
                            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                            ctx.fill();

                            // Node Color
                            ctx.fillStyle = node.color || '#9ca3af';
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                            ctx.fill();

                            // Text
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#000'; // Text Color
                            // Check theme? For now assume black text on light bg, or adjust
                            ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#eee' : '#333';
                            ctx.fillText(label, node.x, node.y + 8);
                        }}
                    />
                )}
            </div>

            <div className="bg-background border-t p-2 text-xs text-center text-muted-foreground">
                Drag to move • Scroll to zoom • Hover for details
            </div>
        </div>
    );
}
