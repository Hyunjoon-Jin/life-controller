import React, { useState } from 'react';
import { Task, TaskCustomField, CustomFieldDefinition } from '@/types';
import { useData } from '@/context/DataProvider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TaskCustomFieldsProps {
    taskFields?: TaskCustomField[];
    onChange: (fields: TaskCustomField[]) => void;
    projectId?: string;
}

export function TaskCustomFields({ taskFields = [], onChange, projectId }: TaskCustomFieldsProps) {
    const { customFieldDefinitions, addCustomFieldDefinition } = useData();
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState<CustomFieldDefinition['type']>('text');

    // Filter definitions relevant to this project or global
    const availableDefinitions = customFieldDefinitions.filter(def => !def.projectId || def.projectId === projectId);

    const handleValueChange = (defId: string, value: any) => {
        const existing = taskFields.find(f => f.fieldId === defId);
        if (existing) {
            onChange(taskFields.map(f => f.fieldId === defId ? { ...f, value } : f));
        } else {
            onChange([...taskFields, { fieldId: defId, value }]);
        }
    };

    const handleCreateDefinition = () => {
        if (!newFieldName.trim()) return;
        const newDef: CustomFieldDefinition = {
            id: crypto.randomUUID(),
            name: newFieldName,
            type: newFieldType,
            projectId // Optional: bind to project if desired, currently making it project-specific if projectId exists
        };
        addCustomFieldDefinition(newDef);
        setNewFieldName('');
        setIsManageOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">사용자 정의 필드</Label>
                <Popover open={isManageOpen} onOpenChange={setIsManageOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" /> 필드 추가
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80">
                        <div className="space-y-4">
                            <h4 className="font-medium leading-none">새 필드 만들기</h4>
                            <div className="grid gap-2">
                                <Label htmlFor="name">필드명</Label>
                                <Input
                                    id="name"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">유형</Label>
                                <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">텍스트</SelectItem>
                                        <SelectItem value="number">숫자</SelectItem>
                                        <SelectItem value="date">날짜</SelectItem>
                                        <SelectItem value="select">선택 (Single)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreateDefinition}>생성</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-4">
                {availableDefinitions.map(def => {
                    const field = taskFields.find(f => f.fieldId === def.id);
                    const value = field?.value ?? '';

                    return (
                        <div key={def.id} className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">{def.name}</Label>
                            <div className="col-span-3">
                                {def.type === 'text' && (
                                    <Input
                                        value={value as string}
                                        onChange={(e) => handleValueChange(def.id, e.target.value)}
                                        placeholder={`${def.name} 입력`}
                                    />
                                )}
                                {def.type === 'number' && (
                                    <Input
                                        type="number"
                                        value={value as string}
                                        onChange={(e) => handleValueChange(def.id, Number(e.target.value))}
                                    />
                                )}
                                {def.type === 'date' && (
                                    <Input
                                        type="date"
                                        value={value ? new Date(value as string).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleValueChange(def.id, new Date(e.target.value))}
                                    />
                                )}
                                {/* Implement Select later if needed */}
                            </div>
                        </div>
                    );
                })}
                {availableDefinitions.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md">
                        정의된 필드가 없습니다. '필드 추가'를 눌러 시작하세요.
                    </div>
                )}
            </div>
        </div>
    );
}
