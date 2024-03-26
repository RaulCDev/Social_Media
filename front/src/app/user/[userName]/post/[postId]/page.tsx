"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Account_Card from '../../../../components/PostCards/PostCard';
import Post_Cards from '../../../../components/PostCards/PostCards';
import WritePost from '../../../../components/Write-Post';
import LeftSide from '../../../../components/LeftSide';
import RightSide from '../../../../components/RightSide';
import { IconArrowLeft } from '@tabler/icons-react';


interface UserProfileProps {
  userName: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName }) => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data based on the userName parameter
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/api/user?userName=${userName}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    }

    // Call the function to fetch user data
    fetchData();
  }, [userName]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{userName} Profile</h1>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
      {/* Render more user data */}
    </div>
  );
};

export default UserProfile;