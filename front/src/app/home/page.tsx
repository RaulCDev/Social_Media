"use client";

import { useState } from "react";
import WritePost from "../components/Write-Post";
import PostTipes from "../components/PostTipes";
import LeftSide, { type SidebarSection } from "../components/LeftSide";
import RightSide from "../components/RightSide";
import Post_Cards from "../components/PostCards/PostCards";
import { useAuth } from "@/components/AuthProvider";

function HomeContent() {
  const { user } = useAuth();
  const username = user?.username ?? "";
  const [activeSection, setActiveSection] = useState<SidebarSection>(null);

  return (
    <div className="homeShell">
        <LeftSide
          userFullName={username}
          userName={username}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        {activeSection ? (
          <main className="sectionWorkspace" aria-label={`${activeSection} section`}>
            <h1 className="sectionWorkspaceTitle">{activeSection}</h1>
          </main>
        ) : (
          <main className="flex">
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
