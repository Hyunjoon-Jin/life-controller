import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, ProjectRisk } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectRisksProps {
    project: Project;
}

export function ProjectRisks({ project }: ProjectRisksProps) {
    const { projectRisks, addProjectRisk, updateProjectRisk, deleteProjectRisk } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [desc, setDesc] = useState('');
    const [prob, setProb] = useState<ProjectRisk['probability']>('medium');
    const [impact, setImpact] = useState<ProjectRisk['impact']>('medium');
    const [mitigation, setMitigation] = useState('');

    const risks = projectRisks.filter(r => r.projectId === project.id);

    const handleAdd = () => {
        if (!desc) return;
        const newRisk: ProjectRisk = {
            id: crypto.randomUUID(),
            projectId: project.id,
            description: desc,
            probability: prob,
            impact: impact,
            mitigationStrategy: mitigation,
            status: 'open'
        };
        addProjectRisk(newRisk);
        setIsAddDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setDesc('');
        setProb('medium');
        setImpact('medium');
        setMitigation('');
    };

    const toggleStatus = (risk: ProjectRisk) => {
        const newStatus = risk.status === 'open' ? 'mitigated' : risk.status === 'mitigated' ? 'closed' : 'open';
        updateProjectRisk({ ...risk, status: newStatus });
    };

    const getRiskScore = (p: string, i: string) => {
        const map: any = { low: 1, medium: 2, high: 3 };
        return map[p] * map[i];
    };

    const getRiskColor = (score: number) => {
        if (score >= 6) return 'bg-red-100 text-red-700 border-red-200'; // High Risk
        if (score >= 3) return 'bg-orange-100 text-orange-700 border-orange-200'; // Medium
        return 'bg-green-100 text-green-700 border-green-200'; // Low
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        리스크 관리 대장
                    </h3>
                    <p className="text-sm text-muted-foreground">프로젝트의 잠재적 위험 요소를 식별하고 대응 전략을 수립합니다.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="destructive">
                    <Plus className="w-4 h-4 mr-2" /> 리스크 등록
                </Button>
            </div>

            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">위험 내용</TableHead>
                            <TableHead className="text-center">가능성</TableHead>
                            <TableHead className="text-center">영향도</TableHead>
                            <TableHead className="text-center">위험도</TableHead>
                            <TableHead>대응 전략</TableHead>
                            <TableHead className="text-center">상태</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {risks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    등록된 리스크가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            risks.map(risk => {
                                const score = getRiskScore(risk.probability, risk.impact);
                                return (
                                    <TableRow key={risk.id}>
                                        <TableCell className="font-medium">{risk.description}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={risk.probability === 'high' ? 'bg-red-50' : ''}>
                                                {risk.probability.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={risk.impact === 'high' ? 'bg-red-50' : ''}>
                                                {risk.impact.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={`text-xs font-bold px-2 py-1 rounded-full border ${getRiskColor(score)} inline-block`}>
                                                Score: {score}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {risk.mitigationStrategy || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div
                                                className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold border transition-colors ${risk.status === 'open' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' :
                                                        risk.status === 'mitigated' ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' :
                                                            'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => toggleStatus(risk)}
                                            >
                                                {risk.status === 'open' ? 'Open' : risk.status === 'mitigated' ? 'Mitigated' : 'Closed'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deleteProjectRisk(risk.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 리스크 등록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>위험 내용 (Risk Description)</Label>
                            <Textarea
                                placeholder="어떤 위험이 발생할 수 있나요?"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>발생 가능성 (Probability)</Label>
                                <Select value={prob} onValueChange={(v: any) => setProb(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>영향도 (Impact)</Label>
                                <Select value={impact} onValueChange={(v: any) => setImpact(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>대응 전략 (Mitigation Strategy)</Label>
                            <Textarea
                                placeholder="위험 발생 시 또는 예방을 위해 무엇을 해야 하나요?"
                                value={mitigation}
                                onChange={e => setMitigation(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                        <Button onClick={handleAdd} variant="destructive">등록하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
