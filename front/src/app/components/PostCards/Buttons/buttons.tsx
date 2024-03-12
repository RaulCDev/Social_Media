import React, { useState } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconHeartFilled } from '@tabler/icons-react'
import axios from "axios";

const PostButtons = () => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  const handleLike = async () => {
    try {
      // Make a POST request to the Flask API endpoint to like the post
      await axios.post(`http://127.0.0.1:5000/cards`);

      // Update the local state to reflect the change
      setIsHeartFilled(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex space-x-2">
      <button className="postIcons rounded-full">
        <IconMessageCircle className="w-4 h-4" />
      </button>
      <button className="postIcons rounded-full">
        <IconRepeat className="w-4 h-4" />
      </button>
      <button className="postIconsHeart rounded-full" onClick={() => setIsHeartFilled(!isHeartFilled)}>
        {isHeartFilled ? <IconHeartFilled className="w-4 h-4" /> : <IconHeart className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PostButtons;