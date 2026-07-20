import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import { Clock, Database, Home, Share2, Trash2, Truck } from "lucide-react";

import { Footer } from "@/components/about/Footer";
import Header from "@/components/layout/Header";

const SERVICE_NAME = "데나무";
const CONTACT_EMAIL = "boostcamp9web05@gmail.com";
const EFFECTIVE_DATE = "2026. 08. 01";

const TOC = [
  "개인정보의 처리 목적",
  "처리하는 개인정보의 항목",
  "14세 미만 아동의 개인정보 처리에 관한 사항",
  "개인정보의 처리 및 보유 기간",
  "개인정보의 파기 절차 및 방법",
  "개인정보의 제3자 제공에 관한 사항",
  "개인정보 처리업무의 위탁에 관한 사항",
  "개인정보의 국외 수집 및 이전에 관한 사항",
  "개인정보의 안전성 확보조치에 관한 사항",
  "개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항",
  "제3자의 행태정보 수집·이용 및 거부에 관한 사항",
  "정보주체와 법정대리인의 권리·의무 및 행사방법에 관한 사항",
  "개인정보 보호책임자에 관한 사항",
  "정보주체의 권익침해에 대한 구제방법",
  "개인정보 처리방침의 변경에 관한 사항",
];

const HIGHLIGHTS = [
  {
    icon: Database,
    title: "수집 항목",
    body: ["이메일, 닉네임, 비밀번호", "IP·쿠키, 서비스 이용기록", "RSS 신청: 실명·블로그 정보"],
  },
  {
    icon: Clock,
    title: "보유 기간",
    body: ["회원 탈퇴 시까지", "이용 통계: 최대 14개월"],
  },
  {
    icon: Share2,
    title: "제3자 제공",
    body: ["원칙적 미제공", "(법령에 따라 예외)"],
  },
  {
    icon: Truck,
    title: "처리 위탁",
    body: ["AWS, Google LLC", "(인프라·통계·메일 발송)"],
  },
  {
    icon: Trash2,
    title: "파기 방법",
    body: ["전자파일 재생불가 파기", "종이문서 분쇄·소각"],
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Helmet>
        <title>개인정보처리방침 - {SERVICE_NAME}</title>
        <meta name="description" content={`${SERVICE_NAME} 개인정보처리방침`} />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <section className="border-b border-gray-200 pb-10">
          <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
          <p className="mt-6 text-sm leading-7 text-gray-600">
            {SERVICE_NAME}(이하 '서비스')는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한
            바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에
            따라 정보주체에게 개인정보의 처리와 보호에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고
            원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-500">시행일: {EFFECTIVE_DATE}</p>
        </section>

        {/* Highlights */}
        <section
          aria-label="주요 개인정보 처리 표시"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <Icon className="h-6 w-6 text-green-600" aria-hidden="true" />
              <div>
                <strong className="text-sm font-semibold text-gray-900">{title}</strong>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  {body.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Table of contents */}
        <nav aria-label="목차" className="mt-10 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">목차</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {TOC.map((title, index) => (
              <li key={title}>
                <a href={`#section-${index + 1}`} className="text-gray-600 hover:text-green-600 hover:underline">
                  제 {index + 1}조 {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content */}
        <div className="mt-12 space-y-12">
          <Article id={1} title="개인정보의 처리 목적">
            <P>
              {SERVICE_NAME}는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 외의
              용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를
              받는 등 필요한 조치를 이행할 예정입니다.
            </P>
            <Ol>
              <Li label="회원 가입 및 관리">
                회원 가입 의사 확인, 본인 식별·인증, 회원 자격 유지·관리, 서비스 부정이용 방지를 목적으로 개인정보를
                처리합니다.
              </Li>
              <Li label="서비스 제공">
                RSS 기반 기술 블로그 큐레이션, 검색, 댓글·좋아요, 개발자 채팅 등 기본적인 서비스 제공을 목적으로
                개인정보를 처리합니다.
              </Li>
              <Li label="RSS(블로그) 등록 신청 처리">
                블로그 소유자의 RSS 등록 신청 접수, 심사 및 승인·거부 결과 통지를 목적으로 개인정보를 처리합니다.
              </Li>
              <Li label="서비스 이용 통계 분석 및 개선">
                서비스 이용에 대한 분석, 인구통계학적 분석 및 서비스 개선을 목적으로 개인정보를 처리합니다.
              </Li>
            </Ol>
          </Article>

          <Article id={2} title="처리하는 개인정보의 항목">
            <P>
              {SERVICE_NAME}는 서비스 제공을 위해 필요 최소한의 범위에서 다음의 개인정보를 수집·이용하며, 각 항목의 처리
              법적 근거는 다음과 같습니다.
            </P>
            <Ol>
              <Li label="회원 가입 시 (이메일 가입)">
                <Ul>
                  <li>법적 근거: 「개인정보 보호법」 제15조제1항제4호(계약의 체결·이행)</li>
                  <li>필수: 이메일, 비밀번호, 닉네임</li>
                  <li>선택: 프로필 이미지, 자기소개</li>
                </Ul>
              </Li>
              <Li label="소셜 로그인 시 (Google, GitHub)">
                <Ul>
                  <li>법적 근거: 「개인정보 보호법」 제15조제1항제4호(계약의 체결·이행)</li>
                  <li>
                    소셜 서비스 제공자(Google, GitHub)로부터 제공받는 계정 식별자, 이메일, 이름(닉네임), 프로필
                    이미지(URL)
                  </li>
                </Ul>
              </Li>
              <Li label="RSS(블로그) 등록 신청 시">
                <Ul>
                  <li>법적 근거: 「개인정보 보호법」 제15조제1항제1호(정보주체의 동의)</li>
                  <li>필수: 실명, 이메일, 블로그명, RSS 주소</li>
                  <li>회원 가입 없이도 신청할 수 있으며, 신청 시 위 정보가 수집·저장됩니다.</li>
                </Ul>
              </Li>
              <Li label="서비스 이용 과정에서 자동으로 수집되는 정보">
                <Ul>
                  <li>법적 근거: 「개인정보 보호법」 제15조제1항제4호(계약의 체결·이행)</li>
                  <li>IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 브라우저 및 기기 정보</li>
                </Ul>
              </Li>
            </Ol>
            <p className="text-sm leading-7 text-gray-500">
              ※ {SERVICE_NAME}는 댓글·개발자 채팅 등 공개되는 영역에 정보주체가 민감정보(사상·신념, 건강 등)를 입력하지
              않도록 주의를 권고합니다.
            </p>
          </Article>

          <Article id={3} title="14세 미만 아동의 개인정보 처리에 관한 사항">
            <P>
              {SERVICE_NAME}는 만 14세 미만 사용자의 개인정보는 수집하지 않습니다. 단, 만 14세 미만 아동의 개인정보를
              처리하기 위하여 개인정보보호법에 따른 동의를 받아야 할 때는 그 법정대리인에게 동의를 받고, 개인정보 사용이
              끝나면 해당 정보를 바로 삭제하며, 개인정보가 사용되는 동안 개인정보를 안전하게 관리합니다.
            </P>
          </Article>

          <Article id={4} title="개인정보의 처리 및 보유 기간">
            <P>
              {SERVICE_NAME}는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보 수집 시 안내한 보유·이용
              기간 내에서 개인정보를 처리·보유합니다. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
            </P>
            <Ol>
              <Li label="회원 정보">
                <Ul>
                  <li>회원 탈퇴 시까지 보유하며, 탈퇴 시 지체 없이 파기합니다.</li>
                  <li>다만, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.</li>
                </Ul>
              </Li>
              <Li label="RSS 등록 신청 정보">
                <Ul>
                  <li>
                    RSS 등록 신청 시 수집된 정보(실명, 이메일, 블로그명, RSS 주소)는 등록 심사 및 서비스 운영을 위해
                    보유합니다.
                  </li>
                  <li>정보주체는 제12조에 따라 삭제를 요청할 수 있으며, 요청 시 지체 없이 파기합니다.</li>
                </Ul>
              </Li>
              <Li label="서비스 이용 통계 분석 정보">
                <Ul>
                  <li>Google Analytics를 통해 수집된 정보는 최대 14개월간 보관되며, 이후 자동 삭제됩니다.</li>
                </Ul>
              </Li>
            </Ol>
          </Article>

          <Article id={5} title="개인정보의 파기 절차 및 방법">
            <P>
              {SERVICE_NAME}는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이
              해당 개인정보를 파기합니다. 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를
              별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.
            </P>
            <Ol>
              <Li label="파기절차">
                {SERVICE_NAME}는 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호책임자의 승인을 받아 개인정보를
                파기합니다.
              </Li>
              <Li label="파기방법">
                전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된
                개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
              </Li>
              <Li label="외부 서비스에 의해 처리되는 개인정보">
                Google Analytics를 통해 처리되는 개인정보는 서비스 제공자의 정책에 따라 일정 기간 보관 후 자동으로
                삭제되며, 보관 기간은 <Anchor href="#section-4">'제4조 개인정보의 처리 및 보유 기간'</Anchor>에서 확인할
                수 있습니다.
              </Li>
            </Ol>
          </Article>

          <Article id={6} title="개인정보의 제3자 제공에 관한 사항">
            <P>{SERVICE_NAME}는 정보주체의 개인정보를 제3자에게 제공하지 않습니다.</P>
            <P>다만, 법령에 따라 제공 의무가 발생하는 경우에는 관련 법령에 따라 개인정보를 제공할 수 있습니다.</P>
          </Article>

          <Article id={7} title="개인정보 처리업무의 위탁에 관한 사항">
            <P>
              {SERVICE_NAME}는 원활한 개인정보 업무 처리를 위하여 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
            </P>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">위탁받는 자 (수탁자)</th>
                    <th className="px-4 py-3 font-medium">위탁업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">Amazon Web Services, Inc.</td>
                    <td className="px-4 py-3">서버 운영 및 개인정보 보관 (클라우드 인프라)</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">Google LLC</td>
                    <td className="px-4 py-3">
                      홈페이지 이용자 접속 및 이용 통계 분석, 이메일 발송 (회원 인증, 비밀번호 재설정, RSS 등록 신청 결과
                      통지)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <P>
              {SERVICE_NAME}는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보
              처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을
              계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다. 위탁업무의
              내용이나 수탁자가 변경될 경우에는 지체없이 본 개인정보 처리방침을 통하여 공개하도록 하겠습니다.
            </P>
          </Article>

          <Article id={8} title="개인정보의 국외 수집 및 이전에 관한 사항">
            <P>
              {SERVICE_NAME}는 서비스 이용 통계 분석 및 이메일 발송을 위하여 다음과 같이 개인정보를 국외로 이전하고
              있습니다.
            </P>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">이전받는 자</th>
                    <th className="px-4 py-3 font-medium">이전 국가</th>
                    <th className="px-4 py-3 font-medium">이전 항목</th>
                    <th className="px-4 py-3 font-medium">이전 목적</th>
                    <th className="px-4 py-3 font-medium">보유·이용기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">Google LLC</td>
                    <td className="px-4 py-3">미국</td>
                    <td className="px-4 py-3">쿠키, IP 주소, 기기 및 브라우저 정보, 서비스 이용 기록</td>
                    <td className="px-4 py-3">서비스 이용 통계 분석</td>
                    <td className="px-4 py-3">최대 14개월</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">Google LLC</td>
                    <td className="px-4 py-3">미국</td>
                    <td className="px-4 py-3">이메일 주소, 이름(실명 또는 닉네임)</td>
                    <td className="px-4 py-3">이메일 발송 (회원 인증, 비밀번호 재설정, RSS 등록 신청 결과 통지)</td>
                    <td className="px-4 py-3">발송 목적 달성 시까지</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Ol>
              <Li label="국외이전의 법적 근거">
                <Ul>
                  <li>「개인정보 보호법」 제28조의8제1항제3호 (계약 이행을 위한 국외 처리위탁·보관)</li>
                </Ul>
              </Li>
              <Li label="이전 일시 및 방법">
                <Ul>
                  <li>서비스 이용 및 이메일 발송 시점에 정보통신망을 통해 전송</li>
                </Ul>
              </Li>
              <Li label="이전 거부 방법 및 거부 효과">
                <Ul>
                  <li>
                    통계 분석 목적의 이전은 브라우저 쿠키 설정을 통해 거부할 수 있으며, 이 경우 일부 서비스 이용에
                    제한이 있을 수 있습니다.
                  </li>
                  <li>이메일 발송은 회원 인증 및 계정 관리에 필수적이므로 거부 시 서비스 이용이 제한될 수 있습니다.</li>
                </Ul>
              </Li>
            </Ol>
          </Article>

          <Article id={9} title="개인정보의 안전성 확보조치에 관한 사항">
            <P>{SERVICE_NAME}는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</P>
            <Ol>
              <Li label="관리적 조치">
                <Ul>
                  <li>개인정보 보호를 위한 내부 관리 기준을 수립하고 최소한의 범위에서 개인정보를 처리합니다.</li>
                  <li>개인정보 처리 권한을 최소한의 인원으로 제한하고 있습니다.</li>
                </Ul>
              </Li>
              <Li label="기술적 조치">
                <Ul>
                  <li>비밀번호는 복호화가 불가능한 방식으로 암호화하여 저장·관리합니다.</li>
                  <li>개인정보가 포함된 데이터는 전송 시 암호화 통신(HTTPS)을 사용하여 보호합니다.</li>
                  <li>관리자 계정에 대한 접근 통제 및 인증 절차를 적용하여 무단 접근을 방지하고 있습니다.</li>
                </Ul>
              </Li>
              <Li label="물리적 조치">
                <Ul>
                  <li>
                    본 서비스는 외부 클라우드 기반 인프라를 사용하고 있으며, 물리적 서버 관리는 각 서비스 제공자의 보안
                    정책에 따라 안전하게 운영됩니다.
                  </li>
                </Ul>
              </Li>
            </Ol>
          </Article>

          <Article id={10} title="개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항">
            <P>
              {SERVICE_NAME}는 서비스 이용 과정에서 이용 정보를 저장하고 수시로 불러오는 '쿠키(Cookie)'를 사용합니다.
              쿠키는 웹사이트 운영에 이용되는 서버(http)가 정보주체의 브라우저에 보내는 소량의 정보로서 정보주체의
              컴퓨터 또는 모바일에 저장됩니다.
            </P>
            <Ol>
              <Li label="쿠키의 사용 목적">
                <Ul>
                  <li>로그인 상태 유지 및 Google Analytics를 통한 이용 현황 분석·서비스 개선을 위해 사용됩니다.</li>
                </Ul>
              </Li>
              <Li label="쿠키 설정 거부 방법">
                <Ul>
                  <li>정보주체는 브라우저 옵션 설정을 통해 쿠키 허용·차단 등의 설정을 할 수 있습니다.</li>
                  <li>쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 제한이 있을 수 있습니다.</li>
                </Ul>
              </Li>
            </Ol>
            <div className="mt-4 rounded-lg bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-900">쿠키 허용 / 차단 방법</p>
              <details className="mt-2 text-sm text-gray-600">
                <summary className="cursor-pointer">웹 브라우저에서 쿠키 허용/차단</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    크롬(Chrome): 우측 상단 '⋮' &gt; 설정 &gt; 개인정보 보호 및 보안 &gt; 쿠키 및 기타 사이트 데이터
                  </li>
                  <li>엣지(Edge): 우측 상단 '…' &gt; 설정 &gt; 쿠키 및 사이트 권한</li>
                </ul>
              </details>
            </div>
          </Article>

          <Article id={11} title="제3자의 행태정보 수집·이용 및 거부에 관한 사항">
            <P>
              {SERVICE_NAME}는 서비스 이용 통계 분석을 위해 제3자가 개인정보 자동 수집 장치를 통해 행태정보를 수집하도록
              허용하고 있습니다.
            </P>
            <Ol>
              <Li label="수집 사업자 및 도구">Google LLC / Google Analytics (자바스크립트 기반 웹 분석 도구)</Li>
              <Li label="수집 항목">IP 주소, 브라우저 정보, 방문 페이지, 방문 시간, 이용 기록 등</Li>
              <Li label="수집 목적">웹사이트 이용 통계 분석 및 서비스 개선</Li>
              <Li label="보유 및 이용 기간">최대 14개월</Li>
              <Li label="거부 방법">
                이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다. (제 10조 참조)
              </Li>
            </Ol>
          </Article>

          <Article id={12} title="정보주체와 법정대리인의 권리·의무 및 행사방법에 관한 사항">
            <P>
              정보주체는 {SERVICE_NAME}에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 및 동의 철회 등을 요구할 수
              있습니다. 회원은 서비스 내 프로필 수정 및 회원 탈퇴 기능을 통해 직접 개인정보를 조회·수정하거나 삭제할 수
              있으며, 아래 연락처를 통해서도 권리 행사를 요청할 수 있습니다.
            </P>
            <P>
              권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수도 있습니다. {SERVICE_NAME}
              는 권리 행사를 한 자가 본인이거나 정당한 대리인인지를 확인하며, 청구를 받은 날로부터 10일 이내에
              회신하겠습니다.
            </P>
          </Article>

          <Article id={13} title="개인정보 보호책임자에 관한 사항">
            <P>
              {SERVICE_NAME}는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리
              및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </P>
            <div className="mt-4 rounded-lg border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-900">▶ 개인정보 보호책임자 / 문의처</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex gap-4">
                  <span className="w-20 shrink-0 text-gray-400">담당</span>
                  <span>{SERVICE_NAME} 운영팀</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-20 shrink-0 text-gray-400">이메일</span>
                  <Anchor href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Anchor>
                </li>
              </ul>
            </div>
          </Article>

          <Article id={14} title="정보주체의 권익침해에 대한 구제방법">
            <P>
              정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보 분쟁조정위원회, 한국인터넷진흥원 개인정보 침해
              신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
            </P>
            <Ol>
              <Li>
                개인정보 분쟁조정위원회: (국번없이) 1833-6972 (
                <ExternalLink href="https://www.kopico.go.kr">www.kopico.go.kr</ExternalLink>)
              </Li>
              <Li>
                개인정보침해 신고센터: (국번없이) 118 (
                <ExternalLink href="https://privacy.kisa.or.kr">privacy.kisa.or.kr</ExternalLink>)
              </Li>
              <Li>
                경찰청: (국번없이) 182 (<ExternalLink href="https://ecrm.police.go.kr">ecrm.police.go.kr</ExternalLink>)
              </Li>
            </Ol>
          </Article>

          <Article id={15} title="개인정보 처리방침의 변경에 관한 사항">
            <P>이 개인정보 처리방침은 {EFFECTIVE_DATE}부터 적용됩니다.</P>
            <P>이전 버전은 존재하지 않습니다.</P>
          </Article>
        </div>

        {/* Back */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white transition-colors hover:bg-green-600"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            메인 페이지로 돌아가기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Article({ id, title, children }: { id: number; title: string; children: React.ReactNode }) {
  return (
    <article id={`section-${id}`} className="scroll-mt-6">
      <h2 className="text-xl font-semibold text-primary">
        ■ 제 {id}조 {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </article>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-7 text-gray-600">{children}</p>;
}

function Ol({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-gray-600">{children}</ol>;
}

function Li({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <li>
      {label && <strong className="font-semibold text-gray-800">{label}</strong>}
      {label ? <div className="mt-1">{children}</div> : children}
    </li>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}

function Anchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-green-600 hover:underline">
      {children}
    </a>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
      {children}
    </a>
  );
}
