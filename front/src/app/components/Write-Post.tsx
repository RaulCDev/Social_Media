import React, { useState, ChangeEvent } from 'react';
import { Card, Avatar } from '@nextui-org/react';
import Link from 'next/link';
import { IconGif, IconPhoto, IconMoodSmile } from '@tabler/icons-react';

export default function WritePost({
  userName,
  avatarUrl,
}: {
  userName: string;
  avatarUrl: string;
}) {
  const [content, setContent] = useState('');
  const token = localStorage.getItem('token');

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = '54px';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setContent(textarea.value);
  };

  const handlePostClick = () => {
    const postData = {
      content: content,
    };

    fetch('http://localhost:5000/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error connecting to the API');
      }
      return response.json();
    })
    .then(data => {
      console.log('Server response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
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
          <button
            onClick={handlePostClick}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-full pl-4 pr-4 pt-1 pb-1"
          >
            Post
          </button>
        </div>
      </div>
    </Card>
  );
}
