import { Link, LinkProps } from "@tanstack/react-router";
import { LucideIcon, ArrowRight } from "lucide-react";

import { TransId } from "@/i18n";
import { Trans } from "@/components";
import { Button } from "@/components/ui/button";

type Props<T> = {
  title: TransId;
  description: TransId;
  emptyMessage: TransId;
  viewAllText: TransId;
  Icon: LucideIcon;
  data: T[];
  total?: number;
  render: (data: T) => React.ReactNode;
  viewAllLink: LinkProps["to"];
};

const HomeSubSection = <T,>({
  title,
  description,
  emptyMessage,
  viewAllText,
  Icon,
  data,
  total,
  render,
  viewAllLink,
}: Props<T>) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div>
        <div className="-mb-1 flex items-center gap-1">
          <Icon />
          <h2 className="text-lg font-bold">
            <Trans id={title} />
          </h2>
        </div>
        <p className="text-xs opacity-70">
          <Trans id={description} />
        </p>
      </div>
      <Button asChild variant="link" size="sm">
        <Link to={viewAllLink}>
          <Trans
            id={viewAllText}
            count={(total ?? data.length).toLocaleString()}
          />
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
    {data.length === 0 ? (
      <div className="hidden text-xs italic opacity-35 md:block">
        <Trans id={emptyMessage} />
      </div>
    ) : (
      <div className="hidden grid-cols-2 gap-2 md:grid">
        {data.slice(0, 4).map(render)}
      </div>
    )}
  </div>
);

export default HomeSubSection;
