import React, { useState, forwardRef } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconHeartFilled, IconEye, IconBookmark, IconShare2 } from '@tabler/icons-react'

type Post_ButtonsProps = {
  key: string | number;
}

const Post_Buttons: React.FC<Post_ButtonsProps> = ({ key }) => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      // Make a POST request to the Flask API endpoint to like the post
      if (token) {
        const response = await fetch(`http://localhost:5000/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key })
        })
        const data = await response.json();
        console.log(data);
      }
      // Update the local state to reflect the change
      setIsHeartFilled(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex w-full">
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconMessageCircle className="w-4 h-4" /><span>0</span>
      </button>
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconRepeat className="w-4 h-4" /><span>0</span>
      </button>
      <button className="postIconsHeart rounded-full flex items-center space-x-1" onClick={() => setIsHeartFilled(!isHeartFilled)}>
        {isHeartFilled ? <IconHeartFilled className="w-4 h-4" /> : <IconHeart className="w-4 h-4" />}<span>0</span>
      </button>
      <button className="postIcons rounded-full flex items-center space-x-1">
        <IconEye className="w-4 h-4" /><span>0</span>
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

export default Post_Buttons