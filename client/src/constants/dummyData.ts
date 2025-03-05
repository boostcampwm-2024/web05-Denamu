import { ChatType } from "@/types/chat";
import { PostDetailType } from "@/types/post";

// export const TRENDING_POSTS: Post[] = [
//   {
//     id: 1,
//     createdAt: new Date().toISOString(),
//     title: "Next.js 14로 풀스택 웹 개발하기",
//     viewCount: 0,
//     path: "/",
//     author: "김개발",
//     thumbnail: "https://picsum.photos/640/480?random=101",
//     blogPlatform: "etc",
//   },
//   {
//     id: 2,
//     createdAt: new Date().toISOString(),
//     title: "실무에서 바로 쓰는 React 성능 최적화 팁",
//     viewCount: 0,
//     path: "/",
//     author: "박프론트",
//     thumbnail: "https://picsum.photos/640/480?random=102",
//     blogPlatform: "etc",
//   },
//   {
//     id: 3,
//     createdAt: new Date().toISOString(),
//     title: "TypeScript 5.0 새로운 기능 톺아보기",
//     viewCount: 0,
//     path: "/",
//     author: "이타스",
//     thumbnail: "https://picsum.photos/640/480?random=103",
//     blogPlatform: "etc",
//   },

//   {
//     id: 7,
//     createdAt: new Date().toISOString(),
//     title: "GraphQL과 Apollo로 데이터 관리하기",
//     viewCount: 0,
//     path: "/",
//     author: "윤백엔드",
//     thumbnail: "https://picsum.photos/640/480?random=104",
//     blogPlatform: "etc",
//   },
// ];

export const CHAT_ITEM: ChatType[] = [
  {
    chatImg: "https://github.com/shadcn.png",
    username: "김철수",
    timestamp: "오전 9:15",
    message: "안녕하세요! 오늘 회의 시간 변동 있나요?",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "이영희",
    timestamp: "오전 9:18",
    message: "안녕하세요! 시간은 그대로예요. 10시에 시작합니다.",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "박지민",
    timestamp: "오전 9:20",
    message: "오늘 자료 준비는 다들 끝내셨나요?",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "정명기",
    timestamp: "오전 9:22",
    message: "아직 덜끝냈습니다람쥐",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "최민수",
    timestamp: "오전 9:25",
    message: "네, 방금 마지막 자료 정리했어요.",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "김지영",
    timestamp: "오전 9:27",
    message: "저도 준비 끝났습니다. 공유드릴게요.",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "정다은",
    timestamp: "오전 9:30",
    message: "혹시 오늘 회의 안건 추가된 거 있나요?",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "정명기",
    timestamp: "오전 9:22",
    message: "없습니다리미",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "오준혁",
    timestamp: "오전 9:32",
    message: "새로운 안건은 없어요. 기존에 계획한 내용 진행하면 될 것 같아요.",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "김수현",
    timestamp: "오전 9:35",
    message: "다들 준비되셨으면 시간 맞춰서 만나겠습니다!",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "이민호",
    timestamp: "오전 9:40",
    message: "확인했습니다. 조금 이따 뵐게요.",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "홍길동",
    timestamp: "오전 9:45",
    message: "회의 끝나고 나서 추가 논의 시간 가질 수 있을까요?",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "윤아름",
    timestamp: "오전 9:50",
    message: "네, 괜찮습니다. 끝나고 바로 논의하죠!",
  },
  {
    chatImg: "https://github.com/shadcn.png",
    username: "한지민",
    timestamp: "오전 9:55",
    message: "다들 화이팅입니다!",
  },
];

export const FULL_KEYWORD_ITEM = ["JavaScript", "React", "Node.js", "TypeScript", "Terraform"];
export const ONE_KEYWORD_ITEM = ["MYSQL"];

export const POST_MODAL_DATA: PostDetailType = {
  message: "피드 상세 데이터 전송 완료",
  data: {
    id: 999,
    author: "공룡똥 블로그",
    blogPlatform: "Velog",
    title: "Test Title",
    path: "https://naver.com",
    createdAt: "2025-01-16T01:00:00.000Z",
    thumbnail: "https://velog.velcdn.com/images/seok3765/post/ae79f20a-b64c-4b6d-b246-6e501f9c868a/image.png",
    viewCount: 999999,
    summary:
      "# React의 이벤트 시스템 심층 분석\nReact의 합성 이벤트(Synthetic Event) 시스템에 대한 상세한 기술 문서입니다. 이 글에서는 React가 어떻게 브라우저 간의 이벤트 처리 차이를 해결하고, 성능을 최적화하는지 다룹니다.\n\n주요 내용:\n- 브라우저 호환성을 위한 합성 이벤트 시스템 구현 원리\n- 이벤트 위임을 통한 성능 최적화 방식\n- React 17에서 달라진 이벤트 처리 메커니즘\n- 실제 코드 예제와 함께 보는 이벤트 핸들링 패턴\n\n특히 마우스 휠 이벤트나 클릭 이벤트 처리에서 브라우저별 차이를 어떻게 극복하는지, 그리고 1000개의 리스트 아이템을 어떻게 효율적으로 처리하는지 등 실무에서 마주치는 구체적인 사례들을 통해 React의 이벤트 시스템을 깊이 있게 이해할 수 있습니다.",
    tag: ["JavaScript", "React", "Frontend"],
  },
};
