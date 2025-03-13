import { LockClosedIcon } from "@heroicons/react/24/outline";
import Countdown from "react-countdown";
import dayjs from "@/lib/dayjs";
import { useState } from "react";

export function Lock({ countdownTime }: { countdownTime: number }) {
  const [isLocked, setIsLocked] = useState(true);
  const time = dayjs
    .unix(countdownTime || 0)
    .add(3, "m")
    .valueOf();

  return (
    isLocked && (
      <div className="absolute flex flex-col justify-center items-center bg-zinc-900 bg-opacity-80 top-0 left-0 w-full h-full z-30">
        <div className="flex items-center space-x-2">
          <LockClosedIcon className="w-8 h-8 text-white" />
          <Countdown
            date={time}
            renderer={({ minutes, seconds }) => (
              <span className="text-white text-2xl">
                {minutes}m {seconds}s
              </span>
            )}
            onComplete={() => setIsLocked(false)}
          />
        </div>
        <div className="mt-5">
          <p className="text-gray-300">
            After the countdown ends, you can post content
          </p>
        </div>
      </div>
    )
  );
}
