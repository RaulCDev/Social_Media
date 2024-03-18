import React, { useState } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconHeartFilled, IconEye, IconBookmark, IconShare2 } from '@tabler/icons-react'

type Post_ButtonsProps = {
  id: number
  views_amount: number
  likes_amount: number
  reposts_amount: number
  comments_amount: number
  is_liked: boolean
}

const Post_Buttons: React.FC<Post_ButtonsProps> = ({ id, views_amount, likes_amount, reposts_amount, comments_amount, is_liked}) => {
  const [isHeartFilled, setIsHeartFilled] = useState(is_liked);
  const [likesAmount, setLikesAmount] = useState(likes_amount);
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
          body: JSON.stringify({ postId: id })
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
          setLikesAmount(prevLikesAmount => prevLikesAmount + 1); // Incrementar el número de likes en 1
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex w-full">
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconMessageCircle className="w-4 h-4" /><span>{comments_amount}</span>
      </button>
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconRepeat className="w-4 h-4" /><span>{reposts_amount}</span>
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
