import { AnimatePresence, motion } from "framer-motion";

import { PostCard } from "@/components/common/Card/PostCard";

import { usePositionTracking } from "@/hooks/common/usePositionTracking.ts";

import { Post } from "@/types/post";

interface AnimatedPostGridProps {
  posts: Post[];
}

const AnimatedPostGrid = ({ posts }: AnimatedPostGridProps) => {
  const { hasPosition } = usePositionTracking(posts);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 relative">
      <AnimatePresence initial={false}>
        {posts.map((post) => {
          return (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: hasPosition(post.id) ? 1 : 0, scale: hasPosition(post.id) ? 1 : 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.3 },
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 25,
              }}
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: "transparent",
                }}
                transition={{ duration: 0.2 }}
              >
                <PostCard post={post} className="transition-shadow duration-300" />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPostGrid;
