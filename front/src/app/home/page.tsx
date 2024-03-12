"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Account_Card from '../components/PostCards/PostCard';
import WritePost from '../components/Write-Post';
import PostTipes from '../components/PostTipes';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';
import Account_Cards from '../components/PostCards/PostCards';

export default function Home() {
  const [user, setUser] = useState({});
  // Get the token from local storage
  const token = localStorage.getItem('token');

  // Send a GET request to the /get_user/<token> endpoint with the token as a query parameter
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
          // Save the user data in the state
          setUser(data);
          console.log(data);
        })
        .catch(error => {
          // Handle any errors that occur during the request
          console.error(error);
        });
    }
  }, [token]);

  return (
    <>
      <div className="flex justify-center">
          <LeftSide userFullName={user.username} userName={user.username} avatarUrl={user.avatarUrl} content={"Mondongo"}/>
          <main className='flex'>
            <div className='midContainer'>
              <PostTipes />
              <WritePost userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Post"/>
              <Account_Cards/>
            </div>
            <RightSide />
          </main>
      </div>
    </>
  );
}