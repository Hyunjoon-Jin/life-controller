'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Calendar, GripVertical, CheckSquare, Users, Lightbulb, Clock } from "lucide-react"

interface GuideModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GuideModal({ isOpen, onOpenChange }: GuideModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] bg-card text-card-foreground flex flex-col rounded-3xl border-transparent shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        📚 데일리 스케줄러 사용 가이드
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        앱의 주요 기능과 사용법을 안내합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 pr-4 mt-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8 pb-8">
                        {/* Section 1: Calendar */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                <Calendar className="w-5 h-5" />
                                캘린더
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300 leading-relaxed pl-7 border-l-2 border-primary/20">
                                <p>• <strong>일정 추가/수정:</strong> 캘린더의 빈 공간을 클릭하여 새 일정을 만듭니다.</p>
                                <p>• <strong>주간/일간 뷰:</strong> 상단의 탭을 통해 보기 모드를 전환할 수 있습니다.</p>
                            </div>
                        </section>

                        {/* Section 2: Tasks & Goals */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                                <CheckSquare className="w-5 h-5" />
                                작업 & 목표 관리
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300 leading-relaxed pl-7 border-l-2 border-blue-500/20">
                                <p>• <strong>작업(Task):</strong> 할 일을 리스트로 관리합니다. 중요도에 따라 태그를 지정할 수 있습니다.</p>
                                <p>• <strong>목표(Goal):</strong> 큰 목표를 설정하고, 하위 목표를 달성하며 진행률을 추적하세요.</p>
                                <p>• <strong>습관(Habit):</strong> 매일의 습관을 체크하고 연속 달성 기록(Streak)을 쌓으세요.</p>
                            </div>
                        </section>

                        {/* Section 3: New Features */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-400">
                                <Lightbulb className="w-5 h-5" />
                                아이디어, 목표 & 인맥
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300 leading-relaxed pl-7 border-l-2 border-yellow-500/20">
                                <p>• <strong>아이디어 보드:</strong> 갑자기 떠오른 생각을 포스트잇처럼 붙여두세요.</p>
                                <p>• <strong>목표 관리:</strong> '목표' 탭에서 장기/단기 목표를 트리 형태로 시각화하여 관리하세요.</p>
                                <p>• <strong>인맥 관리:</strong> 소중한 관계 정보를 기록하세요.</p>
                                <p>• <strong>스크랩:</strong> 유용한 기사나 링크를 저장하세요.</p>
                            </div>
                        </section>

                        {/* Section 4: Productivity Tools */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-red-400">
                                <Clock className="w-5 h-5" />
                                포모도로 타이머
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300 leading-relaxed pl-7 border-l-2 border-red-500/20">
                                <p>• <strong>집중 모드:</strong> 25분 집중, 5분 휴식 기법을 통해 효율을 높이세요.</p>
                                <p>• 우측 사이드바 상단에서 타이머를 바로 실행할 수 있습니다.</p>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#333] text-center text-xs text-muted-foreground">
                    Tip: 단축키나 더 많은 설정은 추후 업데이트 예정입니다.
                </div>
            </DialogContent>
        </Dialog>
    );
}
