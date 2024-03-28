"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Post_Card from '../../components/PostCards/PostCard';
import Post_Cards from '../../components/PostCards/PostCards';
import WritePost from '../../components/Write-Post';
import LeftSide from '../../components/LeftSide';
import RightSide from '../../components/RightSide';
import { IconArrowLeft } from '@tabler/icons-react';


export default function Post({ params }: { params: { userName: string, postId : number } }) {
  const [postData, setPostData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await fetch('http://localhost:5000/postData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_name: params.userName,
            post_id: params.postId,
          }),
        });
        if (!response.ok) {
          throw new Error('Error fetching post data');
        }
        const postData = await response.json();
        setPostData(postData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    fetchPostData();
  }, [params.userName, params.postId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center">
      <LeftSide userFullName={params.userName} userName={params.userName}/>
      <main className='flex'>
        <div className='midContainer'>
          <button className='btn p-2 flex items-center'>
            <IconArrowLeft />
            <h1 className='text-xl font-bold pl-5'>Post</h1>
          </button>
          <div>
          <Post_Card
            id={postData.id}
            userFullName={postData.userFullName}
            userName={postData.userName}
            avatarUrl={postData.avatarUrl}
            content={postData.content}
            likes_amount={postData.likes}
            views_amount={postData.views}
            comments_amount={postData.comments.length}
            isLiked={postData.isLiked}
          />
          {postData.comments.map((comment, index) => (
            <Post_Card
              key={index}
              id={comment.id}
              userFullName={comment.userFullName}
              userName={comment.userFullName}
              avatarUrl={comment.userFullName}
              content={comment.content}
              likes_amount={comment.likes}
              views_amount={comment.views}
              comments_amount={comment.comments_amount}
              isLiked={comment.isLiked}
            />
          ))}
          </div>
        </div>
        <RightSide />
      </main>
    </div>
  );
}