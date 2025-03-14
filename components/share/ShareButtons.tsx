import { ShareIcon } from "@heroicons/react/24/outline";
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterShareButton,
  XIcon,
} from "react-share";

interface Props {
  title: string;
  url: string;
}
export default function ShareButtons({ title, url }: Props) {
  const shareContent = `
${title}
Aitonomy link: ${url}`;
  return (
    <div className="flex items-center space-x-2">
      <ShareIcon className="w-4 h-4" />
      <div className="flex items-center space-x-4 p-2 rounded-lg bg-zinc-800">
        <TwitterShareButton className="w-5 h-5" url={shareContent}>
          <XIcon className="w-5 h-5" round />
        </TwitterShareButton>
        <FacebookShareButton className="w-5 h-5" url={shareContent}>
          <FacebookIcon className="w-5 h-5" round />
        </FacebookShareButton>
      </div>
    </div>
  );
}
