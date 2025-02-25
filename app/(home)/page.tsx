import Threads from "@/components/home/Threads";
import Sidebar from "@/components/home/Sidebar";

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white">
      <div className="flex max-w-7xl mx-auto py-4 space-x-4">
        <Threads className="w-3/4"/>
        <Sidebar className="w-1/4"/>
      </div>
    </div>
  );
}