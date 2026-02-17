import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, ProjectBudgetItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, DollarSign, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Progress } from "@/components/ui/progress";

interface ProjectBudgetProps {
    project: Project;
}

export function ProjectBudget({ project }: ProjectBudgetProps) {
    const { updateProject } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [category, setCategory] = useState('');

    const budgetItems = project.budgetItems || [];

    // Calculate totals
    const totalBudget = project.budget?.total || 0;
    const totalSpent = budgetItems.filter(i => i.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = budgetItems.filter(i => i.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);

    // Remaining Logic: If budget is cost-based, Income might add to budget or be separate. 
    // Usually Budget - Expenses = Remaining.
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const handleAdd = () => {
        if (!desc || !amount) return;

        const newItem: ProjectBudgetItem = {
            id: crypto.randomUUID(),
            projectId: project.id,
            description: desc,
            amount: Number(amount),
            type,
            date: new Date(),
            category: category || 'General'
        };

        const updatedItems = [...budgetItems, newItem];
        // Also update the summary field in Project if needed, but we calculate dynamic here.
        // Optionally update project.budget.spent
        const updatedProject = {
            ...project,
            budgetItems: updatedItems,
            budget: {
                total: project.budget?.total || 0,
                spent: totalSpent + (type === 'expense' ? Number(amount) : 0)
            }
        };

        updateProject(updatedProject);
        setIsAddDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm('삭제하시겠습니까?')) {
            const updatedItems = budgetItems.filter(i => i.id !== id);
            const newSpent = updatedItems.filter(i => i.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

            updateProject({
                ...project,
                budgetItems: updatedItems,
                budget: {
                    total: project.budget?.total || 0,
                    spent: newSpent
                }
            });
        }
    };

    const resetForm = () => {
        setDesc('');
        setAmount('');
        setType('expense');
        setCategory('');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        예산 관리 (Budget)
                    </h3>
                    <p className="text-sm text-muted-foreground">프로젝트 비용 집행 내역을 추적 관리합니다.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> 내역 추가
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 예산</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">집행 금액 (Spent)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{formatCurrency(totalSpent)}</div>
                        <Progress value={percentUsed} className="h-2 mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">{percentUsed.toFixed(1)}% 사용됨</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">잔액 (Remaining)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(remaining)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List */}
            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader>
                    <CardTitle className="text-base">입출금 내역</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0">
                                <tr className="border-b">
                                    <th className="h-10 px-4 text-left font-medium">날짜</th>
                                    <th className="h-10 px-4 text-left font-medium">항목</th>
                                    <th className="h-10 px-4 text-left font-medium">카테고리</th>
                                    <th className="h-10 px-4 text-right font-medium">금액</th>
                                    <th className="h-10 px-4 text-center font-medium">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-24 text-center text-muted-foreground">내역이 없습니다.</td>
                                    </tr>
                                ) : (
                                    budgetItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                                        <tr key={item.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">{format(new Date(item.date), 'yyyy-MM-dd')}</td>
                                            <td className="p-4 font-medium">{item.description}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-bold ${item.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                                                {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 비용/수입 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">유형</Label>
                            <Select value={type} onValueChange={(val: any) => setType(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">지출 (Expense)</SelectItem>
                                    <SelectItem value="income">수입/추가예산 (Income)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">항목명</Label>
                            <Input value={desc} onChange={e => setDesc(e.target.value)} className="col-span-3" placeholder="예: 서버 비용, 디자인 외주" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">카테고리</Label>
                            <Input value={category} onChange={e => setCategory(e.target.value)} className="col-span-3" placeholder="예: Cloud, HR, License" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">금액</Label>
                            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="col-span-3" placeholder="0" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                        <Button onClick={handleAdd}>추가하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
