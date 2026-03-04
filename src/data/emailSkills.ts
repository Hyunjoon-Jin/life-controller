// ─────────────────────────────────────────────────────────────────────────────
// 비즈니스 이메일 작성 스킬 데이터베이스
// 출처: PureWrite, Indeed, Talaera, McKinsey, AtomicMail, Superhuman, 링글,
//       센텐시파이, 다우오피스 등 (인터넷 리서치 2026-03)
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailPhrase {
    ko: string;
    en?: string;
}

export interface PhraseCategory {
    id: string;
    label: string;
    icon: string;
    phrases: EmailPhrase[];
}

export interface EmailTemplate {
    id: string;
    type: string;
    label: string;
    subject: string;
    body: string;
}

export interface EmailTip {
    id: string;
    title: string;
    desc: string;
    icon: string;
}

// ── 상황별 표현 사전 ──────────────────────────────────────────────────────────
export const PHRASE_CATEGORIES: PhraseCategory[] = [
    {
        id: 'opening',
        label: '오프닝',
        icon: '✉️',
        phrases: [
            { ko: '안녕하십니까, [부서] [이름]입니다.', en: 'I hope this message finds you well.' },
            { ko: '지난번 미팅에서 논의한 [주제]와 관련하여 연락드립니다.', en: "I'm reaching out regarding [topic] from our last meeting." },
            { ko: '다름이 아니라 [용건]에 대해 말씀드리고자 합니다.', en: "I'd like to circle back to our previous conversation about [topic]." },
            { ko: '평소 많은 관심과 성원에 감사드립니다.', en: 'Thank you for your continued support.' },
        ],
    },
    {
        id: 'request',
        label: '요청',
        icon: '🙏',
        phrases: [
            { ko: '[날짜]까지 검토 후 회신 부탁드립니다.', en: 'Could you please review and respond by [date]?' },
            { ko: '바쁘시더라도 [날짜]까지 확인 부탁드립니다.', en: "I'd appreciate it if you could [action] by [date]." },
            { ko: '아래 내용 확인 후 의견 주시면 감사하겠습니다.', en: 'Please share your thoughts at your earliest convenience.' },
            { ko: '[자료명] 공유 부탁드려도 될까요?', en: 'Would it be possible to share [document]?' },
            { ko: '가능하시면 이번 주 내로 회신 주시겠습니까?', en: 'Could we schedule a brief call this week?' },
        ],
    },
    {
        id: 'report',
        label: '보고',
        icon: '📊',
        phrases: [
            { ko: '[프로젝트명] 진행 현황을 공유드립니다.', en: "I'm writing to update you on [project]." },
            { ko: '이번 주 업무 결과를 아래와 같이 보고드립니다.', en: 'Please find the weekly report attached for your review.' },
            { ko: '현재까지 진행 상황은 다음과 같습니다.', en: 'The status of [project] is as follows:' },
            { ko: '[이슈]가 발생하여 보고드립니다. 조치 방안은 다음과 같습니다.', en: 'I wanted to bring to your attention that [issue] has occurred.' },
        ],
    },
    {
        id: 'proposal',
        label: '제안',
        icon: '💡',
        phrases: [
            { ko: '[솔루션/아이디어]를 제안드리고자 합니다.', en: "I'd like to propose [idea/solution]." },
            { ko: '귀사와의 협력 방안에 대해 제안드립니다.', en: "I'm reaching out to explore a potential collaboration." },
            { ko: '검토해 주신다면 상호 이익이 될 것이라 생각합니다.', en: 'I believe this could benefit both parties significantly.' },
            { ko: '미팅을 통해 상세히 설명드릴 기회를 주시면 감사하겠습니다.', en: "I'd love to schedule a 30-minute call to discuss further." },
        ],
    },
    {
        id: 'decline',
        label: '거절',
        icon: '🚫',
        phrases: [
            { ko: '충분히 검토해 보았으나, 아쉽게도 이번에는 수락이 어려운 상황입니다.', en: "After careful consideration, I'm afraid we're unable to proceed at this time." },
            { ko: '제안의 취지는 충분히 이해하나, 현재 여건상 진행이 어렵습니다.', en: "Unfortunately, this doesn't align with our current priorities." },
            { ko: '원하시는 회답을 드리지 못해 송구스럽게 생각합니다.', en: 'I respectfully decline, but hope we can explore future opportunities.' },
            { ko: '향후 기회가 생기면 다시 논의할 수 있기를 바랍니다.', en: 'I hope we can collaborate on a future project.' },
        ],
    },
    {
        id: 'thanks',
        label: '감사',
        icon: '🙌',
        phrases: [
            { ko: '빠른 회신 감사드립니다.', en: 'Thank you for your prompt response.' },
            { ko: '바쁘신 중에 검토해 주셔서 감사드립니다.', en: 'I truly appreciate your time and assistance.' },
            { ko: '도움 주셔서 진심으로 감사드립니다.', en: 'Your help has been invaluable.' },
            { ko: '함께해 주셔서 감사드리며, 앞으로도 잘 부탁드립니다.', en: 'Thanks in advance for your cooperation.' },
        ],
    },
    {
        id: 'apology',
        label: '사과',
        icon: '🙇',
        phrases: [
            { ko: '[문제]로 인해 불편을 드려 진심으로 사과드립니다.', en: 'I sincerely apologize for [issue].' },
            { ko: '제 실수로 인한 상황에 깊이 사죄드립니다.', en: 'I take full responsibility for what happened.' },
            { ko: '재발 방지를 위해 [조치]를 취하였습니다.', en: "I've taken steps to correct the error and prevent recurrence." },
            { ko: '부족한 부분이 있었다면 말씀해 주시면 즉시 수정하겠습니다.', en: 'I assure you this will not happen again.' },
        ],
    },
    {
        id: 'closing',
        label: '클로징',
        icon: '🔚',
        phrases: [
            { ko: '바쁘신 중에 검토 부탁드리며, [날짜]까지 회신 주시면 감사하겠습니다.', en: 'Looking forward to your response by [date].' },
            { ko: '궁금하신 점은 언제든 연락 주십시오.', en: 'Please feel free to reach out if you have any questions.' },
            { ko: '확인 후 회신 부탁드립니다.', en: 'Thank you in advance for your time and consideration.' },
            { ko: '좋은 하루 되십시오.', en: 'Best regards,' },
        ],
    },
];

// ── 유형별 이메일 템플릿 ────────────────────────────────────────────────────
export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'report',
        type: 'report',
        label: '업무 보고',
        subject: '[보고] {기간} 업무 현황 보고 — {이름}',
        body: `안녕하세요 {팀장명} 팀장님,

{기간} 업무 성과를 아래와 같이 보고드립니다.

■ 핵심 수치
 - {항목 1}: {내용}
 - {항목 2}: {내용}
 - 주요 이슈: {이슈 내용}

■ 다음 주 계획
 - {Action 1}
 - {Action 2}

검토 후 의견 주시면 반영하겠습니다.
감사합니다.`,
    },
    {
        id: 'request',
        type: 'request',
        label: '검토 요청',
        subject: '[요청] {문서명} 검토 — 회신 기한 {날짜}',
        body: `안녕하세요 {이름}님,

{프로젝트명} 관련 {문서명}을 첨부합니다.
{날짜}까지 검토 후 수정 의견 주시면 감사하겠습니다.

검토 요청 사항:
 1. {항목 1}
 2. {항목 2}
 3. {항목 3}

바쁘신 중에 부탁드려 죄송합니다.
궁금하신 점은 언제든 연락 주십시오.

감사합니다.`,
    },
    {
        id: 'decline',
        type: 'decline',
        label: '정중한 거절',
        subject: 'Re: {제안명} 검토 결과 안내',
        body: `안녕하세요 {이름}님,

귀한 제안 보내주셔서 감사드립니다.
내부적으로 신중히 검토한 결과, 현재 당사의 방향과 맞지 않아
이번에는 함께하기 어려울 것 같습니다.

기회를 주셔서 감사드리며, 향후 협력 기회가 생기면 다시 연락드리겠습니다.

감사합니다.`,
    },
    {
        id: 'proposal',
        type: 'proposal',
        label: '신규 제안',
        subject: '[제안] {핵심 가치} — {회사명}',
        body: `안녕하십니까 {직함} {성함}님,

저는 {회사명}의 {이름}입니다.
귀사의 {문제/니즈}에 기여할 수 있는 솔루션을 제안드리고자 연락드립니다.

저희 솔루션의 주요 특징:
 - {특징 1}
 - {특징 2}
 - {기대 효과}

자세한 내용은 첨부 자료를 참고해 주시기 바라며,
30분의 미팅 기회를 주신다면 구체적으로 설명드리겠습니다.

시간 내주셔서 감사합니다.`,
    },
    {
        id: 'announcement',
        type: 'announcement',
        label: '공지/안내',
        subject: '[공지] {공지 제목} — {날짜}',
        body: `안녕하세요, {부서명}입니다.

{공지 내용}이 아래와 같이 진행됩니다.

 - 일시: {날짜/시간}
 - 영향 범위: {대상}
 - 대응 방법: {안내사항}

{긴급 연락처}로 연락 주십시오.
불편을 드려 죄송합니다.

{부서명} 드림`,
    },
    {
        id: 'apology',
        type: 'apology',
        label: '사과 메일',
        subject: '[사과] {사안명}에 대한 사과 말씀',
        body: `안녕하세요 {이름}님,

{사안}으로 인해 불편을 드려 진심으로 사과드립니다.

발생 경위:
{경위 설명}

재발 방지 조치:
 - {조치 1}
 - {조치 2}

앞으로 이런 일이 재발하지 않도록 최선을 다하겠습니다.
다시 한번 깊이 사과드립니다.

감사합니다.`,
    },
];

// ── 고급 테크닉 & 핵심 원칙 ──────────────────────────────────────────────────
export const EMAIL_TIPS: EmailTip[] = [
    {
        id: 'bluf',
        icon: '🎯',
        title: 'BLUF 원칙',
        desc: '결론을 첫 문장에 배치하세요 (Bottom Line Up Front). McKinsey·Google이 공식 채택한 구조. 경영진은 이메일을 스캔하므로 첫 30단어가 승부입니다.',
    },
    {
        id: 'subject',
        icon: '📌',
        title: '제목 공식',
        desc: '[태그] + 핵심 내용 + 기한. 50자 이하, 모바일은 30자 이하. [요청]/[공지]/[긴급]/ACTION:/DECISION: 같은 말머리를 활용하세요.',
    },
    {
        id: 'pyramid',
        icon: '🔺',
        title: '피라미드 원칙',
        desc: '결론 → 근거 → 세부사항 순서로 작성. 가장 중요한 정보를 먼저 배치하고 (역피라미드) 세부내용은 이후 단락에 보충하세요.',
    },
    {
        id: 'one-topic',
        icon: '1️⃣',
        title: '단일 주제 원칙',
        desc: '한 이메일에 하나의 주제만 담으세요. 주제가 여러 개라면 별도 메일을 보내는 것이 회신율과 처리율을 높입니다.',
    },
    {
        id: 'numbers',
        icon: '🔢',
        title: '번호 매긴 요청',
        desc: '복수 요청은 반드시 번호를 매기세요. "I have three questions: 1) ... 2) ... 3) ..." 형식이 누락 없는 회신을 유도합니다.',
    },
    {
        id: 'deadline',
        icon: '📅',
        title: '구체적 기한',
        desc: '"ASAP" 대신 "5월 15일(목) 오후 5시까지"처럼 구체적인 날짜+시간을 명시하세요. 모호한 마감은 지연을 만듭니다.',
    },
    {
        id: 'thanks',
        icon: '🙏',
        title: '"Thanks in advance" 효과',
        desc: '사전 감사 표현으로 끝나는 이메일의 회신율은 65.7% — 감사 표현 없는 이메일(46%)보다 20%p 높습니다.',
    },
    {
        id: 'checklist',
        icon: '✅',
        title: '발송 전 5W1H 체크',
        desc: 'Who(수신자 맞는지), What(요청 명확한지), When(기한 있는지), Why(배경 있는지), Where(첨부 있는지), How(다음 액션 있는지) 확인 후 발송.',
    },
    {
        id: 'mistakes',
        icon: '⚠️',
        title: '절대 하지 말 것',
        desc: '① 첨부파일 누락 ② 전체 답장 실수 ③ 감정적 메일 즉시 발송 ④ 이모지·축약어 ⑤ 수신자 오타. 발송 전 반드시 미리보기로 확인하세요.',
    },
];

// ── CC/BCC 가이드 ─────────────────────────────────────────────────────────────
export const CC_GUIDE = [
    { field: 'TO', color: 'blue', desc: '직접 행동/회신이 필요한 수신자. 최소한으로 지정.' },
    { field: 'CC', color: 'yellow', desc: '내용만 알면 되는 참조자. 불필요하게 많이 넣지 않기.' },
    { field: 'BCC', color: 'gray', desc: '개인정보 보호·대량 발송 시. CC와 혼동해 기밀 유출 금지.' },
];
