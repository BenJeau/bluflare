import { Hash, LinkIcon, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

import { Post } from "@/api/posts";
import { cn, highlightKeywords } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { TransId } from "@/i18n";
import { Trans } from "@/components";

export type Props = {
  post: Post;
  offset?: number;
  keywords: string[];
  className?: string;
};

const PostCard: React.FC<Props> = ({
  post,
  offset = 0,
  keywords,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, delay: 0.05 * offset }}
    className={cn(
      "dark:bg-card/30 flex flex-col overflow-hidden rounded-lg border bg-green-50 shadow-xs",
      className,
    )}
  >
    <div className="text-muted-foreground bg-card flex items-center justify-between gap-1 border-b p-2 text-xs">
      <div className="flex flex-col">
        {/* <a
              href={`https://bsky.app/profile/${post.aka[0].split("//")[1]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="text-xs text-primary font-bold hover:underline">
                {post.aka[0].split("//")[1]}
              </p>
            </a> */}
        {dayjs(post.created_at).format("LLL")}
      </div>
      <div className="flex gap-2">
        <Tag data={post.urls} Icon={LinkIcon} title="urls" />
        <Tag data={post.tags} Icon={Hash} title="hashtags" />
      </div>
    </div>
    <div className="flex items-stretch justify-between gap-2">
      <div>
        {/* <a
              href={`https://bsky.app/profile/${did}/post/${rkey}`}
              target="_blank"
              rel="noopener noreferrer"
            > */}
        <p className="p-2 text-sm font-semibold hover:underline">
          {highlightKeywords(post.text, keywords)}
        </p>
        {/* </a> */}
      </div>
    </div>
  </motion.div>
);

type TagProps = {
  data: string[];
  Icon: LucideIcon;
  title: TransId;
};

const Tag: React.FC<TagProps> = ({ data, Icon, title }) => (
  <HoverCard openDelay={0} open={data.length === 0 ? false : undefined}>
    <HoverCardTrigger>
      <Badge
        className={cn(
          "text-xs",
          data.length > 0
            ? "border-sky-600 bg-sky-600 text-white"
            : "dark:bg-border text-muted-foreground",
        )}
        variant="outline"
      >
        {data.length} <Icon className="h-3 w-3" strokeWidth={2.5} />
      </Badge>
    </HoverCardTrigger>
    <HoverCardContent
      align="end"
      sideOffset={8}
      className="flex max-w-lg flex-col gap-2 text-sm"
    >
      <Trans id={title} />
      <div className="flex flex-1 flex-wrap gap-2">
        {data.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="overflow-hidden overflow-ellipsis whitespace-nowrap"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </HoverCardContent>
  </HoverCard>
);

export default PostCard;
