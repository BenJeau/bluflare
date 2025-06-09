import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useSSELatestPosts, latestPostsOptions, Post } from "@/api/posts";
import { PostCard } from "@/components";

type Props = {
  sseEnabled: boolean;
};

const RecentlyIngestedPosts: React.FC<Props> = ({ sseEnabled }) => {
  const posts = useSuspenseQuery(latestPostsOptions);
  const { data: ssePosts } = useSSELatestPosts(sseEnabled);

  const combinedPosts: Post[] = useMemo(() => {
    const uniquePosts = new Map();
    [...ssePosts, ...posts.data].forEach((post) =>
      uniquePosts.set(post.id, post),
    );
    return Array.from(uniquePosts.values());
  }, [posts, ssePosts]);

  return (
    <>
      {combinedPosts.map((post, index) => (
        <PostCard key={post.id} post={post} className="mb-2" offset={index} />
      ))}
    </>
  );
};

export default RecentlyIngestedPosts;
