interface MarketingConsentNoticeProps {
  showChangeGuide?: boolean;
}

export const MarketingConsentNotice = ({ showChangeGuide = true }: MarketingConsentNoticeProps) => (
  <div className="space-y-1.5 text-sm text-muted-foreground/80">
    <table className="w-full border-collapse overflow-hidden rounded-md border text-left">
      <thead>
        <tr className="divide-x">
          <th scope="col" className="bg-muted/40 px-2 py-1.5 font-medium text-muted-foreground">
            수집·이용 목적
          </th>
          <th scope="col" className="bg-muted/40 px-2 py-1.5 font-medium text-muted-foreground">
            수집 항목
          </th>
          <th scope="col" className="bg-muted/40 px-2 py-1.5 font-medium text-muted-foreground">
            보유·이용 기간
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="divide-x border-t">
          <td className="px-2 py-1.5 align-top">신규 기능, 이벤트, 프로모션 등 마케팅 정보 안내</td>
          <td className="px-2 py-1.5 align-top">이메일 주소</td>
          <td className="px-2 py-1.5 align-top">동의 철회 또는 회원 탈퇴 시까지</td>
        </tr>
      </tbody>
    </table>
    <p>
      동의하지 않으셔도 회원가입 및 서비스 이용에는 제한이 없으며,{" "}
      {showChangeGuide ? "[마이페이지 → 정보 수정]에서 언제든 변경" : "언제든 철회"}할 수 있습니다.
    </p>
  </div>
);
