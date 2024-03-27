"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Account_Card from '../components/PostCards/PostCard';
import WritePost from '../components/Write-Post';
import PostTipes from '../components/PostTipes';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';
import Post_Cards from '../components/PostCards/PostCards';

export default function Home() {
  const [user, setUser] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/get_user_data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          setUser(data);
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [token]);

  return (
    <>
      <div className="flex justify-center">
          <LeftSide userFullName={user.username} userName={user.username}/>
          <main className='flex'>
            <div className='midContainer'>
              <PostTipes />
              <WritePost userName={user.username}/>
              <Post_Cards/>
            </div>
            <RightSide />
          </main>
      </div>
    </>
  );
}