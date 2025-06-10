import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

import { TransId, useTranslation } from "@/i18n";
import { Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getTagColor } from "@/lib/utils";

type Props = {
  data: Record<string, number>;
  title: TransId;
  Icon: React.ElementType;
};

const TopicStats: React.FC<Props> = ({ data, title, Icon }) => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4" /> <Trans id={title} />{" "}
          <span className="text-xs opacity-70">
            (
            <Trans
              id="count.unique.data"
              count={(data && Object.keys(data).length) ?? 0}
              data={t(title).toLocaleLowerCase()}
            />
            )
          </span>
        </p>

        {data && Object.keys(data).length > 15 && (
          <Button
            variant="secondary"
            className="h-6 px-2 py-1"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <Trans id="show.less" /> <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                <Trans id="view.more" />{" "}
                <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex flex-wrap gap-1">
          {data &&
            Object.entries(data)
              .sort((a, b) => b[1] - a[1])
              .slice(0, showAll ? undefined : 15)
              .map(([word, count], i, array) => {
                const isAtleastThreeQuarters = i >= array.length * 0.75;
                const color = getTagColor(i, array.length);

                return (
                  <Badge
                    key={word}
                    variant="outline"
                    style={{ backgroundColor: color }}
                    className={cn(
                      "border-none",
                      isAtleastThreeQuarters && showAll
                        ? "text-black"
                        : "text-white",
                    )}
                  >
                    {word} <span className="text-xs font-bold">{count}</span>
                  </Badge>
                );
              })}

          {Object.entries(data).length === 0 && (
            <p className="text-sm opacity-70">
              <Trans id="no.data" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicStats;
