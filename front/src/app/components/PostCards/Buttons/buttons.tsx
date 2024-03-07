import React, { useState } from "react";
import { IconHeart, IconMessageCircle, IconRepeat, IconHeartFilled } from '@tabler/icons-react'

const PostButtons = () => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);

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