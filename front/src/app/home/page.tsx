"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WritePost from "../components/Write-Post";
import PostTipes from "../components/PostTipes";
import LeftSide, { type SidebarSection } from "../components/LeftSide";
import RightSide from "../components/RightSide";
import Post_Cards from "../components/PostCards/PostCards";
import { useAuth } from "@/components/AuthProvider";

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SidebarSection>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, router, user]);

  if (loading) {
    return <div className="bigLoginContainer" aria-busy="true" />;
  }
  if (!user) return null;

  const username = user.username;

  return (
    <div className="homeShell">
        <LeftSide
          userFullName={username}
          userName={username}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        {activeSection ? (
          <main
            className="sectionWorkspace homeContentArea"
            aria-label={`${activeSection} section`}>
            <h1 className="sectionWorkspaceTitle">{activeSection}</h1>
          </main>
        ) : (
          <main className="homeContentArea">
            <div className="midContainer">
              <PostTipes />
              <WritePost userName={username} />
              <Post_Cards />
            </div>
            <RightSide />
          </main>
        )}
    </div>
  );
}

export default HomeContent;
