import React from "react";
import { IconHeart, IconMessageCircle, IconRepeat } from '@tabler/icons-react'

const PostButtons = () => {
  return (
    <div className="flex space-x-2">
      <button className="postIcons rounded-full">
        <IconMessageCircle className="w-4 h-4" />
      </button>
      <button className="postIcons rounded-full">
        <IconRepeat className="w-4 h-4" />
      </button>
      <button className="postIconsHeart rounded-full">
        <IconHeart className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PostButtons;