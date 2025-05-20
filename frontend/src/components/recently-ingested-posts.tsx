import { useSuspenseQuery } from "@tanstack/react-query";

import { useSSELatestPosts, latestPostsOptions } from "@/api/posts";
import { PostCard } from "@/components";

type Props = {
  sseEnabled: boolean;
};

const RecentlyIngestedPosts: React.FC<Props> = ({ sseEnabled }) => {
  const posts = useSuspenseQuery(latestPostsOptions);
  const { data: ssePosts } = useSSELatestPosts(sseEnabled);

  const combinedPosts = [...ssePosts, ...posts.data];

  return (
    <>
      {combinedPosts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          keywords={[]}
          className="mb-4"
          offset={index}
        />
      ))}
    </>
  );
};

export default RecentlyIngestedPosts;
