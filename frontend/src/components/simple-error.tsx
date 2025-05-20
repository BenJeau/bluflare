import { ChevronLeft, Home, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

interface Props {
  emoji?: string;
  title: string;
  subtitle: string;
  description: string;
  otherButtons?: React.ReactNode;
  data?: string;
}

const SimpleError: React.FC<Props> = ({
  emoji,
  title,
  subtitle,
  description,
  otherButtons,
  data,
}) => (
  <div className="flex h-full w-full flex-1 items-center justify-center self-center p-4">
    <div className="relative flex min-w-[700px] flex-col flex-wrap gap-4">
      {emoji && (
        <div className="text-primary/30 absolute top-0 right-0 ms-4 font-serif text-7xl leading-5 font-bold select-none sm:text-8xl md:text-9xl">
          {emoji}
        </div>
      )}
      <div className="text-primary dark:text-primary ms-4 font-serif text-[10rem] leading-[10rem] font-bold">
        {title}
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-lg font-semibold">
          {subtitle} <span className="italic opacity-50">{data}</span> not found
        </div>
        <div className="text-sm">{description}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="..">
          <Button className="px-3" variant="outline">
            <ChevronLeft size={16} />
          </Button>
        </Link>
        <Button asChild>
          <Link to="/" className="flex-1 gap-2 shadow-md">
            <Home size={16} />
            Home
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/" className="gap-2">
            <LogOut size={16} />
            Logout
          </Link>
        </Button>
        {otherButtons}
      </div>
    </div>
  </div>
);

export default SimpleError;
