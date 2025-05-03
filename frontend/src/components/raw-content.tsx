import { CopyButton } from "@/components";
import { cn } from "@/lib/utils";

const RawContent: React.FC<{
  content?: string;
  className?: string;
}> = ({ content, className }) => (
  <div
    className={cn(
      "dark:border-800 dark:bg-950 relative flex h-full w-full flex-1 overflow-hidden rounded-lg border bg-muted shadow-inner ring-white",
      className,
    )}
  >
    <div className="flex h-full max-h-[400px] min-h-12 flex-1 text-xs dark:bg-black/50">
      <div
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
        className="flex h-full max-h-[400px] w-full flex-1 overflow-y-scroll whitespace-pre-wrap break-all p-3"
      >
        {content}
      </div>
      <div className="absolute bottom-2 right-2">
        <CopyButton text={content} />
      </div>
    </div>
  </div>
);

export default RawContent;
