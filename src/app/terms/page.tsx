import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '이용약관 | Life Controller',
    description: 'Life Controller의 서비스 이용약관입니다.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-6">
            <article className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-black mb-8 pb-4 border-b dark:border-white/10">이용약관</h1>

                <section className="space-y-6">
                    <p className="text-sm text-slate-500">최종 수정일: 2026년 2월 17일</p>

                    <div>
                        <h2 className="text-xl font-bold mb-3">1. 목적</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            본 약관은 Life Controller(이하 "서비스")가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">2. 서비스의 제공 및 변경</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            서비스는 이용자에게 일정 관리, 목표 설정, 데이터 분석 등의 기능을 제공합니다. 서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">3. 면책조항 (중요)</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>서비스는 "있는 그대로" 제공되며, 서비스의 무결성, 적합성, 정확성에 대해 보증하지 않습니다.</li>
                            <li>서비스는 이용자가 서비스에 게재한 정보, 자료, 사실의 신뢰도, 정확성 등에 관하여는 책임을 지지 않습니다.</li>
                            <li>무료 서비스 이용과 관련하여 이용자에게 발생한 어떠한 손해에 대해서도 책임을 지지 않습니다.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">4. 이용자의 의무</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            이용자는 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 서비스가 통지하는 사항 등을 준수하여야 합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">5. 저작권</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            서비스가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 서비스에 귀속됩니다. 이용자는 서비스를 이용함으로써 얻은 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">6. 준거법 및 관할법원</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            본 약관에 명시되지 않은 사항은 대한민국 법령을 따르며, 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 대한민국 서울중앙지방법원을 관할법원으로 합니다.
                        </p>
                    </div>
                </section>
            </article>
        </div>
    );
}
