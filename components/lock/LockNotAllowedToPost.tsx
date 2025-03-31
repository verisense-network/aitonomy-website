import { Alert } from "@heroui/react";

export default function LockNotAllowedToPost() {
  return (
    <div className="absolute bg-zinc-900/80 backdrop-blur-sm top-0 left-0 w-full h-full z-30">
      <div className="flex flex-col h-full justify-center items-center">
        <div className="w-72 mx-auto">
          <Alert
            variant="flat"
            color="warning"
            title="You are not allowed to post"
          />
        </div>
      </div>
    </div>
  );
}
