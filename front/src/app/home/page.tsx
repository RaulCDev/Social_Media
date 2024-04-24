"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Router from 'next/router';
import Link from 'next/link';
import Account_Card from '../components/PostCards/PostCard';
import WritePost from '../components/Write-Post';
import PostTipes from '../components/PostTipes';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';
import Post_Cards from '../components/PostCards/PostCards';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      console.log(token);
      const response = await fetch('http://localhost:5000/get_user_data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          Router.push('/');
        } else {
          throw new Error('Error fetching user data');
        }
      }

      const data = await response.json();
      setUser(data);
      console.log(data);
    };

    fetchData();

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