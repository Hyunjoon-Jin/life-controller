import React from 'react';
import { RecurrenceRule } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';

interface TaskRecurrenceProps {
    recurrence?: RecurrenceRule;
    onChange: (rule?: RecurrenceRule) => void;
}

export function TaskRecurrence({ recurrence, onChange }: TaskRecurrenceProps) {
    const isEnabled = !!recurrence;

    const handleToggle = (checked: boolean) => {
        if (checked) {
            onChange({
                frequency: 'weekly',
                interval: 1
            });
        } else {
            onChange(undefined);
        }
    };

    const handleChange = (field: keyof RecurrenceRule, value: any) => {
        if (!recurrence) return;
        onChange({ ...recurrence, [field]: value });
    };

    return (
        <div className="space-y-4 border p-4 rounded-md bg-muted/10">
            <div className="flex items-center gap-2">
                <Checkbox
                    id="recurrence-toggle"
                    checked={isEnabled}
                    onCheckedChange={handleToggle}
                />
                <Label htmlFor="recurrence-toggle" className="font-semibold">반복 작업 설정</Label>
            </div>

            {isEnabled && recurrence && (
                <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>반복 주기</Label>
                            <Select
                                value={recurrence.frequency}
                                onValueChange={(v) => handleChange('frequency', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">매일</SelectItem>
                                    <SelectItem value="weekly">매주</SelectItem>
                                    <SelectItem value="monthly">매월</SelectItem>
                                    <SelectItem value="yearly">매년</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>간격</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    value={recurrence.interval}
                                    onChange={(e) => handleChange('interval', parseInt(e.target.value))}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {recurrence.frequency === 'daily' && '일마다'}
                                    {recurrence.frequency === 'weekly' && '주마다'}
                                    {recurrence.frequency === 'monthly' && '개월마다'}
                                    {recurrence.frequency === 'yearly' && '년마다'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>종료일 (선택)</Label>
                        <DatePicker
                            date={recurrence.endDate}
                            setDate={(date) => handleChange('endDate', date)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
