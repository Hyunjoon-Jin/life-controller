import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center space-y-4">
            <div className="bg-muted p-4 rounded-full">
                <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground max-w-sm">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            <Link href="/">
                <Button>홈으로 돌아가기</Button>
            </Link>
        </div>
    );
}
