'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Person } from '@/types';
import { useData } from '@/context/DataProvider';
import { Search, ZoomIn, ZoomOut, Maximize, X, Navigation, Share2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Dynamically import ForceGraph2D with no SSR as it depends on window/canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-black tracking-[0.2em] uppercase">CALIBRATING NEURAL MAP...</p>
        </div>
    )
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
        let nodes = people.map(p => ({
            ...p,
            val: (p.tags?.length || 0) + 1 + (p.isMe ? 5 : 0), // Me is bigger
            group: p.relationship,
            color: p.isMe ? '#818cf8' : undefined
        }));

        // Inject Virtual 'Me' if missing
        if (!nodes.some(n => n.isMe)) {
            nodes.push({
                id: 'virtual-me',
                name: 'YOU (Me)',
                relationship: 'me' as any,
                isMe: true,
                val: 10,
                color: '#818cf8',
                tags: [], company: '', school: '', contact: '', notes: '', businessCardImage: '', department: '', jobTitle: '', major: '', birthdate: undefined
            } as any);
        }

        const links: any[] = [];

        for (let i = 0; i < nodes.length; i++) {
            const p1 = nodes[i];

            for (let j = i + 1; j < nodes.length; j++) {
                const p2 = nodes[j];
                const reasons: string[] = [];

                if (p1.isMe || p2.isMe) {
                    reasons.push('me');
                }

                const sharedTags = p1.tags?.filter(tag => p2.tags?.includes(tag)) || [];
                if (sharedTags.length > 0) reasons.push('tag');

                if (p1.company && p2.company && p1.company === p2.company) {
                    reasons.push('company');
                }

                if (p1.school && p2.school && p1.school === p2.school) {
                    reasons.push('school');
                }

                if (p1.industry && p2.industry && p1.industry === p2.industry) {
                    reasons.push('industry');
                }

                if (p1.group && p2.group && p1.group === p2.group) {
                    reasons.push('group');
                }

                if (reasons.length > 0) {
                    let type = 'tag';
                    if (reasons.includes('me')) type = 'me';
                    if (reasons.includes('industry')) type = 'industry';
                    if (reasons.includes('group')) type = 'group';
                    if (reasons.includes('company')) type = 'company';
                    if (reasons.includes('school')) type = 'school';

                    if (reasons.includes('company') || reasons.includes('school')) {
                        type = reasons.includes('company') ? 'company' : 'school';
                    }

                    links.push({
                        source: p1.id,
                        target: p2.id,
                        value: reasons.length + (p1.isMe || p2.isMe ? 0.5 : 0),
                        type,
                        reasons
                    });
                }
            }
        }

        return { nodes, links };
    }, [people]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-indigo-400" strokeWidth={3} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">NEURAL SOCIAL MAP</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] italic">REAL-TIME CONNECTION TOPOLOGY ACTIVE</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-6 bg-white/5 px-6 py-2.5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Self</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Friend</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Work</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 transition-all">
                        <X className="w-6 h-6" strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Graph Container */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat">
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

                {graphData.nodes.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 gap-4">
                        <Share2 className="w-12 h-12 opacity-10" />
                        <p className="text-sm font-black tracking-widest">NO CONNECTION DATA FOUND</p>
                    </div>
                ) : (
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel="name"
                        nodeColor={node => {
                            if ((node as any).isMe) return '#818cf8';
                            switch ((node as any).group) {
                                case 'family': return '#6366f1';
                                case 'friend': return '#10b981';
                                case 'work': return '#3b82f6';
                                default: return '#4b5563';
                            }
                        }}
                        nodeRelSize={6}
                        linkColor={link => {
                            switch ((link as any).type) {
                                case 'company': return 'rgba(59, 130, 246, 0.4)';
                                case 'school': return 'rgba(236, 72, 153, 0.4)';
                                case 'industry': return 'rgba(16, 185, 129, 0.4)';
                                case 'group': return 'rgba(139, 92, 246, 0.4)';
                                case 'me': return 'rgba(129, 140, 248, 0.6)';
                                default: return 'rgba(255, 255, 255, 0.1)';
                            }
                        }}
                        linkWidth={link => ((link as any).type === 'me' || (link as any).type === 'tag') ? 1 : 2}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={d => (d as any).value * 0.002}
                        linkDirectionalParticleWidth={2}
                        linkDirectionalParticleColor={() => '#fff'}
                        // Custom Render for Nodes
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.name;
                            const fontSize = (node.isMe ? 18 : 14) / globalScale;
                            ctx.font = `black ${fontSize}px Inter, sans-serif`;

                            // Node Glow
                            ctx.beginPath();
                            const r = node.isMe ? 10 : 6;
                            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);

                            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.5);
                            let baseColor = '';
                            if (node.isMe) baseColor = '129, 140, 248';
                            else {
                                switch (node.group) {
                                    case 'family': baseColor = '99, 102, 241'; break;
                                    case 'friend': baseColor = '16, 185, 129'; break;
                                    case 'work': baseColor = '59, 130, 246'; break;
                                    default: baseColor = '75, 85, 99'; break;
                                }
                            }
                            gradient.addColorStop(0, `rgba(${baseColor}, 0.8)`);
                            gradient.addColorStop(0.4, `rgba(${baseColor}, 0.2)`);
                            gradient.addColorStop(1, `rgba(${baseColor}, 0)`);

                            ctx.fillStyle = gradient;
                            ctx.arc(node.x, node.y, r * 2.5, 0, 2 * Math.PI, false);
                            ctx.fill();

                            // Main Node
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                            ctx.fillStyle = `rgb(${baseColor})`;
                            ctx.fill();

                            // Border for visibility
                            ctx.lineWidth = 2 / globalScale;
                            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                            ctx.stroke();

                            // Text Label
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.shadowBlur = 4;
                            ctx.shadowColor = 'rgba(0,0,0,0.5)';
                            ctx.fillText(label, node.x, node.y + r + fontSize + 2);
                            ctx.shadowBlur = 0;
                        }}
                    />
                )}

                {/* Legend / Tooltip info */}
                <div className="absolute bottom-10 left-10 flex flex-col gap-4 max-w-xs p-6 glass-premium rounded-[32px] border border-white/10 shadow-2xl relative z-10">
                    <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">NAVIGATION LOG</h3>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">
                            - DRAG NODES TO RESTRUCTURE<br />
                            - SCROLL TO ZOOM IN/OUT<br />
                            - GLOWING PARTICLES INDICATE ACTIVE CONNECTION FLOW
                        </p>
                    </div>
                    <div className="mt-2 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-widest">
                            <span>Signal Strength</span>
                            <span className="text-emerald-500">OPTIMAL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="bg-white/[0.02] border-t border-white/5 px-10 py-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">NODES:</span>
                        <span className="text-[10px] font-black text-indigo-400">{graphData.nodes.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">EDGES:</span>
                        <span className="text-[10px] font-black text-indigo-400">{graphData.links.length}</span>
                    </div>
                </div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    SYSTEM SECURE // END-TO-END SOCIAL ENCRYPTION active
                </div>
            </div>
        </motion.div>
    );
}
