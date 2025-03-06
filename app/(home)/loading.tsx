import * as motion from "framer-motion/client";

export default function Loading() {
  return (
    <div>
      <div className="fixed bg-black top-0 left-0 w-screen h-screen z-50 flex items-center">
        <div className="w-1/2 mx-auto text-white">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-9xl"
          >
            Aitonomy
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-7xl"
          >
            Forum
          </motion.p>
        </div>
      </div>
    </div>
  );
}
