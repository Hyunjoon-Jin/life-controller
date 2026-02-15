'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { fetchAll, updateRow } from '@/lib/supabase-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadUsers = async () => {
        setIsLoading(true);
        const data = await fetchAll<UserProfile>('user_profiles', { skipUserFilter: true });
        setUsers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: UserProfile['status']) => {
        if (!confirm(`사용자 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) return;

        const result = await updateRow('user_profiles', id, { status: newStatus });
        if (result) {
            toast.success('상태가 변경되었습니다.');
            loadUsers();
        } else {
            toast.error('변경 실패');
        }
    };

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'suspended': return 'bg-red-500';
            case 'withdrawn': return 'bg-orange-500';
            case 'dormant': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active' || !u.status).length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Suspended</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Withdrawn</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{users.filter(u => u.status === 'withdrawn').length}</div></CardContent>
                </Card>
            </div>

            {/* User Table */}
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Contact</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Last Active</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-4">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.role || 'user'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="">{user.email}</div>
                                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={`${getStatusColor(user.status)} text-white`}>
                                                {user.status || 'active'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'yyyy-MM-dd HH:mm') : '-'}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {user.status === 'suspended' ? (
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(user.id, 'active')}>
                                                    Unban
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(user.id, 'suspended')}>
                                                    Ban
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
