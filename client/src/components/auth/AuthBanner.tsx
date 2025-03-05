import { useLocation } from "react-router-dom";

import { motion } from "framer-motion";

export const AuthBanner = () => {
  const location = useLocation();
  const skipAnimation = location.state?.from === "/signin" || location.state?.from === "/signup";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-green-800 to-green-700">
      <div className="relative flex h-full flex-col items-center justify-center p-8">
        <motion.div
          className="mb-12"
          initial={skipAnimation ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={`https://denamu.site/files/denamu-icon.svg`} alt="Denamu" className="w-80 h-auto" />
        </motion.div>

        <motion.div
          className="flex flex-col items-center mb-8"
          variants={containerVariants}
          initial={skipAnimation ? "visible" : "hidden"}
          animate="visible"
        />

        <motion.h1
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6"
          initial={skipAnimation ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Denamu
          <br />
        </motion.h1>

        <motion.p
          className="text-2xl text-white/80 text-center"
          initial={skipAnimation ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          개발자들의 이야기가 자라나는 곳
        </motion.p>
      </div>
    </div>
  );
};
