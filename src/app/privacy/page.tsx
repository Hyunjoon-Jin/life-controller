import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '개인정보처리방침 | Life Controller',
    description: 'Life Controller의 개인정보 수집 및 처리 방침을 안내합니다.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-6">
            <article className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-black mb-8 pb-4 border-b dark:border-white/10">개인정보처리방침</h1>

                <section className="space-y-6">
                    <p className="text-sm text-slate-500">최종 수정일: 2026년 2월 17일</p>

                    <div>
                        <h2 className="text-xl font-bold mb-3">1. 총칙</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Life Controller(이하 "서비스")는 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다.
                            본 방침은 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">2. 수집하는 개인정보 항목</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>필수항목:</strong> 이메일 주소, 로그인 공급자 정보(Google 등), 서비스 이용 기록, 쿠키</li>
                            <li><strong>선택항목:</strong> 프로필 이미지, 닉네임, 사용자가 직접 입력한 일정/목표/자산 데이터</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">3. 개인정보의 수집 및 이용목적</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            수집한 개인정보는 다음의 목적을 위해 활용합니다:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>서비스 제공 및 계정 관리 (로그인, 데이터 동기화)</li>
                            <li>서비스 개선 및 신규 서비스 개발</li>
                            <li>맞춤형 광고 제공 (Google AdSense 등)</li>
                        </ul>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h2 className="text-xl font-bold mb-3">4. 쿠키 및 광고 (중요)</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            본 서비스는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.
                            또한 Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자의 과거 방문 기록을 바탕으로 광고를 게재할 수 있습니다.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>Google은 광고 쿠키를 사용하여 이용자가 본 사이트나 다른 사이트에 방문한 기록을 바탕으로 맞춤형 광고를 제공할 수 있습니다.</li>
                            <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 광고 설정</a>에서 맞춤형 광고 설정을 해제할 수 있습니다.</li>
                            <li>또는 <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aboutads.info</a>에 접속하여 제3자 공급업체의 쿠키 사용을 거부할 수 있습니다.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">5. 개인정보의 보유 및 이용기간</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 회원 탈퇴 시까지 계정 정보는 유지되며, 탈퇴 시 30일간의 유예 기간 후 영구 삭제됩니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">6. 이용자의 권리</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 요청할 수 있습니다. 관련 설정은 서비스 내 [설정] 메뉴에서 가능합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-3">7. 문의처</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            개인정보 관련 문의사항은 아래 연락처로 문의해 주시기 바랍니다.<br />
                            이메일: support@lifecontroller.com (예시)
                        </p>
                    </div>
                </section>
            </article>
        </div>
    );
}
