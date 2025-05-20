import { Link, LinkProps } from "@tanstack/react-router";
import { LucideIcon, ArrowRight } from "lucide-react";

import { TransId } from "@/i18n";
import { Trans } from "@/components";
import { Button } from "@/components/ui/button";

type Props<T> = {
  title: TransId;
  description: TransId;
  Icon: LucideIcon;
  data: T[];
  render: (data: T) => React.ReactNode;
  viewAllLink: LinkProps["to"];
};

const HomeSubSection = <T,>({
  title,
  description,
  Icon,
  data,
  render,
  viewAllLink,
}: Props<T>) => (
  <>
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
          <Trans id="view.all" />
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-4">{data.map(render)}</div>
  </>
);

export default HomeSubSection;
