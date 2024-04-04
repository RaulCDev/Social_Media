import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Avatar } from '@nextui-org/react';
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';
import { IconGif, IconPhoto, IconMoodSmile } from '@tabler/icons-react';

type TextAreaPostProps = {
  userName: string;
  avatarUrl: string;
  handlePost: (content: string) => void;
  postId?: number;
};

const TextAreaPost: React.FC<TextAreaPostProps> = ({ userName, avatarUrl, handlePost, postId }) => {
  const [content, setContent] = useState('');
  const [data, setData] = useState([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const token = localStorage.getItem('token');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const postContentRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = '54px';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setContent(textarea.value);
  };

  const handleSubmit = () => {
    if (content.trim() !== '') {
      handlePost(content.trim());
      setContent('');
    } else {
      toast.error('Please enter some text', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = '54px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (postContentRef.current) {
      const textarea = postContentRef.current;
      textarea.style.height = '54px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (postId && postId > 0) {
      fetch('http://localhost:5000/postData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postId),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error connecting to the API');
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        console.log('Server response:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }, [postId, token]);

  return (
      <div className="dropdown-comment rounded-lg border-b-2 border-gray-800" onClick={e => { e.preventDefault();}}>
        {postId && (
          <div className="flex flex-row mb-5">
            <Avatar radius="full" size="md" src={`https://github.com/${data.userName}.png`} className="mr-2" />
            <div className="flex flex-col flex-grow pr-4">
              <div className="flex items-center mb-2">
                <h4 className="text-small font-semibold text-default-600">{data.userFullName}</h4>
                <h5 className="text-small tracking-tight text-default-400 ml-2">@{data.userName}</h5>
              </div>
              <textarea
                ref={postContentRef}
                readOnly
                value={data.content}
                placeholder="What's your post?"
                className="input bg-gray-700 h-28"
              />
            </div>
          </div>
        )}
        <div className="flex gap-x-2 w-full">
          <Link href={`/${userName}`}>
            <Avatar radius="full" size="md" src={avatarUrl} />
          </Link>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="What's your post?"
            className="input bg-gray-700"
          />
        </div>
        <div className="flex justify-between gap-3 border-t border-gray-600 pt-2">
          <div className="flex">
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
          <div className="flex">
            <button className="rounded-full bg-green-600 p-2 hover:bg-green-700 active:bg-green-800" onClick={handleSubmit}>
              Post
            </button>
          </div>
        </div>
      </div>
  );
};

export default TextAreaPost;
