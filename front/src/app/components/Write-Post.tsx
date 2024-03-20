import React, { useState, ChangeEvent } from 'react';
import { Card, Avatar } from '@nextui-org/react';
import Link from 'next/link';
import { IconGif, IconPhoto, IconMoodSmile } from '@tabler/icons-react';

export default function WritePost({
  userFullName,
  userName,
  avatarUrl,
  content,
}: {
  userFullName: string;
  userName: string;
  avatarUrl: string;
  content: string;
}) {

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.target.style.height = "54px";
    event.target.style.height = (event.target.scrollHeight) + "px";
  };

  return (
    <Card className="p-3 shadow-none bg-transparent hover:bg-slate-800 transition border-b rounded-none cursor-pointer border-white/20">
      <div className="cardHeader justify-between flex items-center">
        <div className="flex gap-x-2 w-full">
          <Link href={`/${userName}`}>
            <Avatar radius="full" size="md" src={avatarUrl} />
          </Link>
          <textarea
            onChange={handleChange}
            placeholder="What is happening?!"
            className="input"
          />
        </div>
      </div>
      <div className="cardFooter flex justify-end gap-3 border-t border-gray-600 pt-2">
        <div className="flex justify-start ml-10">
          <button className="mx-2">
            <IconPhoto className="w-5 h-5 text-green-600" />
          </button>
          <button className="mx-2">
            <IconGif className="w-5 h-5 text-green-600" />
          </button>
          <button className="mx-2">
            <IconMoodSmile className="w-5 h-5 text-green-600" />
          </button>
        </div>
        <div className="ml-auto">
          <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-full pl-4 pr-4 pt-1 pb-1">Post</button>
        </div>
      </div>
    </Card>
  );
}
