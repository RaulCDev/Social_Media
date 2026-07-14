"use client";
import React, { useState, useEffect } from "react";
import LeftSide from "../components/LeftSide";
import RightSide from "../components/RightSide";
import { IconArrowLeft } from "@tabler/icons-react";
import { apiFetch } from "@/lib/api-client";

export default function Profile({ params }: { params: { userName: string } }) {
  const [postCount, setPostCount] = useState<number | null>(null);

  useEffect(() => {
    if (params.userName) {
      apiFetch<{ post_count: number }>("/profileData", {
        method: "POST",
        body: JSON.stringify({ user_name: params.userName }),
      })
        .then((data) => {
          setPostCount(data.post_count);
          console.log("CORRECT");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [params.userName]);

  return (
    <>
      <div className="flex justify-center">
        <LeftSide userFullName={params.userName} userName={params.userName} />
        <main className="flex">
          <div className="midContainer">
            <button className="btn p-2 flex items-center">
              <IconArrowLeft />
              <div className="postCountContainer">
                <h1 className="text-xl font-bold pl-5">{params.userName}</h1>
                <p>{postCount} posts</p>
              </div>
            </button>
          </div>
          <RightSide />
        </main>
      </div>
    </>
  );
}
