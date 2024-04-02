import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Avatar } from '@nextui-org/react';
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';

type TextAreaPostProps = {
  userName: string;
  avatarUrl: string;
  handlePost: (content: string) => void;
};

const TextAreaPost: React.FC<TextAreaPostProps> = ({ userName, avatarUrl, handlePost }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const token = localStorage.getItem('token');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
      <div className="dropdown-comment">
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
        <div className="marginLeft sticky">
          <button className="rounded-full bg-green-600 p-2 hover:bg-green-700 active:bg-green-800" onClick={handleSubmit}>
            Post
          </button>
        </div>
        <ToastContainer />
      </div>
  );
};

export default TextAreaPost;
