import { Link } from "@tanstack/react-router";

import { Topic } from "@/api/topics";
import { useTranslation } from "@/i18n";
import { Trans } from "@/components";

type Props = {
  topic: Topic;
};

const HomeTopicCard: React.FC<Props> = ({ topic }) => {
  const { t } = useTranslation();

  return (
    <Link
      key={topic.id}
      to="/topics/$slug"
      params={{ slug: topic.slug }}
      className="bg-background/75 hover:bg-background group flex flex-col rounded-lg border p-2 text-sm shadow-xs transition-all active:shadow-inner"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="overflow-hidden font-medium overflow-ellipsis whitespace-nowrap group-hover:underline">
          {topic.subject}
        </h3>
        <p className="text-xs whitespace-nowrap text-sky-300 opacity-70">
          {topic.post_count?.toLocaleString()} {t("posts").toLowerCase()}
        </p>
      </div>
      {topic.description ? (
        <span className="overflow-hidden text-xs overflow-ellipsis whitespace-nowrap opacity-70">
          {topic.description}
        </span>
      ) : (
        <span className="text-xs italic opacity-35">
          <Trans id="no.description" />
        </span>
      )}
    </Link>
  );
};

export default HomeTopicCard;
