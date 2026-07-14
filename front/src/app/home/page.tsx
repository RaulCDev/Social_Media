"use client";

import WritePost from "../components/Write-Post";
import PostTipes from "../components/PostTipes";
import LeftSide from "../components/LeftSide";
import RightSide from "../components/RightSide";
import Post_Cards from "../components/PostCards/PostCards";
import { useAuth } from "@/components/AuthProvider";

function HomeContent() {
  const { user } = useAuth();
  const username = user?.username ?? "";

  return (
    <>
      <div className="flex justify-center">
        <LeftSide userFullName={username} userName={username} />
        <main className="flex">
          <div className="midContainer">
            <PostTipes />
            <WritePost userName={username} />
            <Post_Cards />
          </div>
          <RightSide />
        </main>
      </div>
    </>
  );
}

export default HomeContent;
