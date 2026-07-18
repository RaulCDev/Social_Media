import React, { useState, useRef, useEffect } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconHeartFilled, IconEye, IconBookmark, IconShare2 } from '@tabler/icons-react'
import { toast } from 'react-toastify';
import TextAreaPost from '../../TextArea-Post';
import { apiFetch } from '@/lib/api-client';
import { useSessionMutation } from '@/components/AuthProvider';

type Post_ButtonsProps = {
  id: number
  views_amount: number
  likes_amount: number
  comments_amount: number
  is_liked: boolean
  userName: string
}

const Post_Buttons: React.FC<Post_ButtonsProps> = ({ id, views_amount, likes_amount, comments_amount, is_liked, userName}) => {
  const [isHeartFilled, setIsHeartFilled] = useState(is_liked);
  const [likesAmount, setLikesAmount] = useState(likes_amount);
  const [content, setContent] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const runMutation = useSessionMutation();

  const handleLike = async () => {
    try {
      if (isHeartFilled) {
        await runMutation(() =>
          apiFetch(`/unlike`, {
            method: 'POST',
            body: JSON.stringify({ postId: id, content }),
          }),
        );
        setIsHeartFilled(false);
        setLikesAmount(prevLikesAmount => prevLikesAmount - 1);
      } else {
        await runMutation(() =>
          apiFetch(`/like`, {
            method: 'POST',
            body: JSON.stringify({ postId: id })
          }),
        );
        setIsHeartFilled(true);
        setLikesAmount(prevLikesAmount => prevLikesAmount + 1);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleCommentButtonClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCommentPost = async () => {
    try {
      await runMutation(() =>
        apiFetch('/comment', {
          method: 'POST',
          body: JSON.stringify({ postId: id, content }),
        }),
      );
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
      <button className='postIcons rounded-full flex items-center space-x-1' onClick={e => { e.preventDefault(); handleCommentButtonClick();}}>
          <IconMessageCircle className="postActionIcon" />
          <span className="postActionCount">{comments_amount}</span>
      </button>
      {isDropdownOpen && <div className="overlay" />}
      {isDropdownOpen && (
        <div className="container-dropdown-comment" onClick={e => { e.preventDefault();}} ref={dropdownRef}>
          <TextAreaPost userName='userName' avatarUrl={`https://github.com/${userName}.png`} handlePost={handleCommentPost} postId={id}/>
        </div>
      )}
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconRepeat className="postActionIcon" /><span className="postActionCount">0</span>
      </button>
      <button className="postIconsHeart rounded-full flex items-center space-x-1" onClick={e => { e.preventDefault(); handleLike();}}>
        { isHeartFilled ? <IconHeartFilled className="postActionIcon" /> : <IconHeart className="postActionIcon" />}<span className="postActionCount">{likesAmount}</span>
      </button>
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconEye className="postActionIcon" /><span className="postActionCount">{views_amount}</span>
      </button>
      <div className="flex items-center ml-auto">
        <button className="postIcons rounded-full flex items-center space-x-1">
          <IconShare2 className="postActionIcon" />
        </button>
        <button className="postIcons rounded-full">
          <IconBookmark className="postActionIcon" />
        </button>
      </div>
    </div>
  )
}

export default Post_Buttons;
