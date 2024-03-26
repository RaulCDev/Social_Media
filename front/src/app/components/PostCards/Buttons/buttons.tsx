import React, { useState, useRef, useEffect  } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconHeartFilled, IconEye, IconBookmark, IconShare2 } from '@tabler/icons-react'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import Link from 'next/link';
import { Avatar } from '@nextui-org/react';
import PostButtons from './Buttons/buttons'

type Post_ButtonsProps = {
  id: number
  views_amount: number
  likes_amount: number
  comments_amount: number
  is_liked: boolean
  userFullName: string
  userName: string
  avatarUrl: string
}

const Post_Buttons: React.FC<Post_ButtonsProps> = ({ id, views_amount, likes_amount, comments_amount, is_liked, userFullName, userName, avatarUrl}) => {
  const [isHeartFilled, setIsHeartFilled] = useState(is_liked);
  const [likesAmount, setLikesAmount] = useState(likes_amount);
  const [content, setContent] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  const handleLike = async () => {
    try {
      if (isHeartFilled) {
        const response = await fetch(`http://localhost:5000/unlike`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId: id, content }),
        });
        const data = await response.json();
        if (response.ok) {
          setIsHeartFilled(false);
          setLikesAmount(prevLikesAmount => prevLikesAmount - 1);
        } else {
          console.error('Error removing like:', data.error);
        }
      } else {
        const response = await fetch(`http://localhost:5000/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId: id })
        })
        const data = await response.json();
        if (data.message === 'Like saved successfully') {
          setIsHeartFilled(true);
          setLikesAmount(prevLikesAmount => prevLikesAmount + 1);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = event.target;
      textarea.style.height = '54px';
      textarea.style.height = `${textarea.scrollHeight}px`;
      const inputValue = event.target.value;
      if (inputValue.length <= 280) {
        setContent(textarea.value);
      }
  };


  const handleCommentButtonClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCommentPost = async () => {
    try {
      const response = await fetch('http://localhost:5000/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, content }),
      });
      const data = await response.json();
      if (response.ok) {
        setContent('');
        toast.success('Comment posted successfully', {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        toast.error(data.message || 'Error posting comment', {
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
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Something went wrong', {
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
    <div className="flex w-full">
      <button className='postIcons rounded-full flex items-center space-x-1' onClick={handleCommentButtonClick}>
          <IconMessageCircle className='w-4 h-4' />
          <span>{comments_amount}</span>
      </button>
      {isDropdownOpen && (
        <div className="container-dropdown-comment">
          <div className="dropdown-comment" ref={dropdownRef}>
            <div className="flex gap-x-2 w-full">
              <Link href={`/${userName}`}>
                <Avatar radius="full" size="md" src={avatarUrl} />
              </Link>
              <textarea
                value={content}
                onChange={handleChange}
                placeholder="What's your comment?"
                className="input bg-gray-700"
              />
            </div>
            <div className="marginLeft sticky">
              <button className="rounded-full bg-green-600 p-2 hover:bg-green-700 active:bg-green-800" onClick={handleCommentPost}>
                Reply
              </button>
            </div>
            <ToastContainer />
          </div>
        </div>
      )}
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconRepeat className="w-4 h-4" /><span>0</span>
      </button>
      <button className="postIconsHeart rounded-full flex items-center space-x-1" onClick={() => handleLike()}>
        { isHeartFilled ? <IconHeartFilled className="w-4 h-4" /> : <IconHeart className="w-4 h-4" />}<span>{likesAmount}</span>
      </button>
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconEye className="w-4 h-4" /><span>{views_amount}</span>
      </button>
      <div className="flex items-center ml-auto">
        <button className="postIcons rounded-full flex items-center space-x-1">
          <IconShare2 className="w-4 h-4" />
        </button>
        <button className="postIcons rounded-full">
          <IconBookmark className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Post_Buttons;
