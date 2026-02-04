export interface SchoolInfo {
    schoolName: string;
    address: string;
    link: string;
    region: string;
    schoolGubun: string;
}

const MOCK_SCHOOLS: SchoolInfo[] = [
    { schoolName: '서울대학교', address: '서울특별시 관악구 관악로 1', link: 'https://www.snu.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '고려대학교', address: '서울특별시 성북구 안암로 145', link: 'https://www.korea.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '연세대학교', address: '서울특별시 서대문구 연세로 50', link: 'https://www.yonsei.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '한양대학교', address: '서울특별시 성동구 왕십리로 222', link: 'https://www.hanyang.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '성균관대학교', address: '서울특별시 종로구 성균관로 25-2', link: 'https://www.skku.edu', region: '서울', schoolGubun: 'univ' },
    { schoolName: '서강대학교', address: '서울특별시 마포구 백범로 35', link: 'https://www.sogang.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '중앙대학교', address: '서울특별시 동작구 흑석로 84', link: 'https://www.cau.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '경희대학교', address: '서울특별시 동대문구 경희대로 26', link: 'https://www.khu.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '한국외국어대학교', address: '서울특별시 동대문구 이문로 107', link: 'https://www.hufs.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '서울시립대학교', address: '서울특별시 동대문구 서울시립대로 163', link: 'https://www.uos.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '카이스트(KAIST)', address: '대전광역시 유성구 대학로 291', link: 'https://www.kaist.ac.kr', region: '대전', schoolGubun: 'univ' },
    { schoolName: '포항공과대학교(POSTECH)', address: '경상북도 포항시 남구 청암로 77', link: 'https://www.postech.ac.kr', region: '경북', schoolGubun: 'univ' },
    { schoolName: '이화여자대학교', address: '서울특별시 서대문구 이화여대길 52', link: 'https://www.ewha.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '건국대학교', address: '서울특별시 광진구 능동로 120', link: 'https://www.konkuk.ac.kr', region: '서울', schoolGubun: 'univ' },
    { schoolName: '동국대학교', address: '서울특별시 중구 필동로 1길 30', link: 'https://www.dongguk.edu', region: '서울', schoolGubun: 'univ' },
    { schoolName: '홍익대학교', address: '서울특별시 마포구 와우산로 94', link: 'https://www.hongik.ac.kr', region: '서울', schoolGubun: 'univ' },
];

export async function searchSchools(query: string): Promise<SchoolInfo[]> {
    if (!query || query.length < 1) return [];

    // CareerNet API usage (Requires API Key)
    const apiKey = process.env.NEXT_PUBLIC_CAREERNET_API_KEY;

    if (apiKey) {
        try {
            const response = await fetch(`https://www.career.go.kr/cnet/openapi/getOpenApi.json?apiKey=${apiKey}&svcType=api&svcCode=SCHOOL&contentType=json&searchSchulNm=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.dataSearch?.content) {
                return data.dataSearch.content.map((item: any) => ({
                    schoolName: item.schoolName,
                    address: item.address,
                    link: item.link,
                    region: item.region,
                    schoolGubun: item.schoolGubun
                }));
            }
        } catch (error) {
            console.error('School search API error:', error);
        }
    }

    // Fallback to Mock Search
    const lowerQuery = query.toLowerCase();
    return MOCK_SCHOOLS.filter(school =>
        school.schoolName.toLowerCase().includes(lowerQuery) ||
        school.region.toLowerCase().includes(lowerQuery)
    );
}
