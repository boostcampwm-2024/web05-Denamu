import { usePostViewIncrement } from "@/hooks/queries/usePostViewIncrement";

// import { pipe } from "@/utils/pipe";
import { Post } from "@/types/post";

interface PostWithState {
  post: Post;
  isWindowOpened?: boolean;
}

export const usePostCardActions = (post: Post) => {
  const { mutate } = usePostViewIncrement(post.id);

  const openPost = ({ post }: Pick<PostWithState, "post">): PostWithState => {
    const link = document.createElement("a");
    link.href = post.path;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
    return { post, isWindowOpened: true };
  };

  const incrementView = ({ post, isWindowOpened }: PostWithState): PostWithState => {
    if (isWindowOpened) {
      mutate(undefined, {
        onSuccess: () => {
          console.log("조회수 증가 성공");
        },
        onError: (error) => {
          console.error("조회수 증가 실패", error);
        },
      });
    }
    return { post, isWindowOpened };
  };

  // const handlePostClick = () => {
  //   if (!post.path) return;
  //   pipe(openPost, incrementView)({ post });
  // };

  return { openPost, incrementView };
};
