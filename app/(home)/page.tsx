import Threads from "@/components/home/Threads";
import Sidebar from "@/components/home/Sidebar";
import SideMenu from "@/components/sideMenu";

export default async function Home() {
  return (
    <div className="flex">
      <SideMenu />
      <div className="max-w-6xl mx-auto py-4 md:inline-flex md:space-x-4">
        <Threads className="md:w-3/4" isShowPostButton />
        <Sidebar className="md:w-1/4" />
      </div>
    </div>
  );
}
