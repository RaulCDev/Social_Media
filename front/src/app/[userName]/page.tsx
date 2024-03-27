"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Account_Card from '../components/PostCards/PostCard';
import Post_Cards from '../components/PostCards/PostCards';
import WritePost from '../components/Write-Post';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';
import { IconArrowLeft } from '@tabler/icons-react'


export default function Profile({ params }: { params: { userName: string } }) {
  const [postCount, setPostCount] = useState(null);

  useEffect(() => {
    if (params.userName) {
      fetch('http://localhost:5000/profileData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_name: params.userName })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching data from server');
        }
        return response.json();
      })
      .then(data => {
        setPostCount(data.post_count);
        console.log("CORRECTO");
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }, [params.userName]);

  return (
    <>
      <div className="flex justify-center">
          <LeftSide userFullName={params.userName} userName={params.userName}/>
          <main className='flex'>
            <div className='midContainer'>
            <button className='btn p-2 flex items-center'>
              <IconArrowLeft />
              <div className="postCountContainer">
              <h1 className='text-xl font-bold pl-5'>{params.userName}</h1>
              <p>{postCount} posts</p>
            </div>
            </button>
            </div>
            <RightSide />
          </main>
      </div>
    </>
  );
}