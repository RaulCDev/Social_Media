"use client";
import React, { useState, useEffect } from "react";
import Post_Card, {
  type PostCardData,
} from "../../components/PostCards/PostCard";
import LeftSide from "../../components/LeftSide";
import RightSide from "../../components/RightSide";
import { IconArrowLeft } from "@tabler/icons-react";

type PostPageData = PostCardData & {
  comments: PostCardData[];
};

export default function Post({
  params,
}: {
  params: { userName: string; postId: number };
}) {
  const [postData, setPostData] = useState<PostPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await fetch("http://localhost:5000/postCards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_name: params.userName,
            post_id: params.postId,
          }),
        });
        if (!response.ok) {
          throw new Error("Error fetching post data");
        }
        const fetchedPostData: PostPageData = await response.json();
        setPostData(fetchedPostData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPostData();
  }, [params.userName, params.postId]);

  if (loading || !postData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center">
      <LeftSide userFullName={params.userName} userName={params.userName} />
      <main className="flex">
        <div className="midContainer">
          <button className="btn p-2 flex items-center">
            <IconArrowLeft />
            <h1 className="text-xl font-bold pl-5">Post</h1>
          </button>
          <div>
            <Post_Card
              id={postData.id}
              userFullName={postData.userFullName}
              userName={postData.userName}
              avatarUrl={postData.avatarUrl}
              content={postData.content}
              likes_amount={postData.likes_amount}
              views_amount={postData.views_amount}
              comments_amount={postData.comments_amount}
              isLiked={postData.isLiked}
            />
            {postData.comments.map((comment, index) => (
              <Post_Card
                key={index}
                id={comment.id}
                userFullName={comment.userFullName}
                userName={comment.userFullName}
                avatarUrl={comment.userFullName}
                content={comment.content}
                likes_amount={comment.likes_amount}
                views_amount={comment.views_amount}
                comments_amount={comment.comments_amount}
                isLiked={comment.isLiked}
              />
            ))}
          </div>
        </div>
        <RightSide />
      </main>
    </div>
  );
}
