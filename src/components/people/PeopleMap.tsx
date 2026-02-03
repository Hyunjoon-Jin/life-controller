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
            val: (p.tags?.length || 0) + 1 + (p.isMe ? 5 : 0), // Me is bigger
            group: p.relationship,
            // Fix 'Me' node to center
            fx: p.isMe ? 0 : undefined,
            fy: p.isMe ? 0 : undefined,
            color: p.isMe ? '#fbbf24' : undefined // Gold for Me
        }));

        const links: any[] = [];
        const meNode = nodes.find(n => n.isMe);

        for (let i = 0; i < nodes.length; i++) {
            const p1 = nodes[i];

            // Link Me to Everyone
            if (meNode && p1.id !== meNode.id) {
                // Avoid duplicating if we are iterating
                // actually easier to just iterate all pairs or do explicit Me links
                // Let's rely on pair loop for shared attributes, and add special Me links
            }

            for (let j = i + 1; j < nodes.length; j++) {
                const p2 = nodes[j];
                const reasons: string[] = [];

                // 0. Me Link (Star Topology)
                if (p1.isMe || p2.isMe) {
                    reasons.push('me');
                }

                // 1. Shared Tags
                const sharedTags = p1.tags?.filter(tag => p2.tags?.includes(tag)) || [];
                if (sharedTags.length > 0) reasons.push('tag');

                // 2. Shared Company (and not empty)
                if (p1.company && p2.company && p1.company === p2.company) {
                    reasons.push('company');
                }

                // 3. Shared School (and not empty)
                if (p1.school && p2.school && p1.school === p2.school) {
                    reasons.push('school');
                }

                if (reasons.length > 0) {
                    // Determine link color/width based on strongest connection
                    let type = 'tag';
                    if (reasons.includes('me')) type = 'me';
                    if (reasons.includes('company')) type = 'company';
                    if (reasons.includes('school')) type = 'school';
                    // Hierarchy: School/Company > Tag > Me

                    links.push({
                        source: p1.id,
                        target: p2.id,
                        value: reasons.length + (p1.isMe || p2.isMe ? 0.5 : 0), // Strength
                        type,
                        reasons
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
                        * <span className="text-amber-500 font-bold">나(Me)</span>를 중심으로 직장, 학교, 태그로 연결됩니다.
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Graph Container */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-black/5 dark:bg-black/20">
                {people.length < 1 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        인맥 데이터가 부족합니다.
                    </div>
                ) : (
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel="name"
                        nodeColor={node => {
                            if ((node as any).isMe) return '#fbbf24'; // Gold
                            switch ((node as any).group) {
                                case 'family': return '#818cf8'; // Indigo
                                case 'friend': return '#4ade80'; // Green
                                case 'work': return '#60a5fa'; // Blue
                                default: return '#9ca3af'; // Gray
                            }
                        }}
                        nodeRelSize={6}
                        linkColor={link => {
                            switch ((link as any).type) {
                                case 'company': return '#60a5fa'; // Blue
                                case 'school': return '#f472b6'; // Pink
                                case 'me': return '#fbbf2440'; // Transparent Gold
                                default: return '#cbd5e1'; // Gray
                            }
                        }}
                        linkWidth={link => (link as any).type === 'me' ? 1 : 2}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={d => (d as any).value * 0.001}
                        // Custom Render for Nodes
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.name;
                            const fontSize = (node.isMe ? 16 : 12) / globalScale;
                            ctx.font = `${node.isMe ? 'bold ' : ''}${fontSize}px Sans-Serif`;

                            // Node shape
                            ctx.beginPath();
                            const r = node.isMe ? 8 : 4;
                            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);

                            if (node.isMe) ctx.fillStyle = '#fbbf24';
                            else {
                                switch (node.group) {
                                    case 'family': ctx.fillStyle = '#818cf8'; break;
                                    case 'friend': ctx.fillStyle = '#4ade80'; break;
                                    case 'work': ctx.fillStyle = '#60a5fa'; break;
                                    default: ctx.fillStyle = '#9ca3af'; break;
                                }
                            }
                            ctx.fill();

                            // Border for Me
                            if (node.isMe) {
                                ctx.lineWidth = 2 / globalScale;
                                ctx.strokeStyle = '#fff';
                                ctx.stroke();
                            }

                            // Text
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#eee' : '#333';
                            ctx.fillText(label, node.x, node.y + r + fontSize);
                        }}
                    />
                )}
            </div>



            <div className="bg-background border-t p-2 text-xs text-center text-muted-foreground">
                Drag to move • Scroll to zoom • Hover for details
            </div>
        </div >
    );
}
