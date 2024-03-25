'use client';
import { useState, useEffect } from 'react';
import { Avatar } from '@nextui-org/react'
import { IconSettings ,IconExternalLink ,IconVip ,IconCashBanknote ,IconBrandLinkedin, IconBrandGithub, IconDots, IconBrandX, IconDotsCircleHorizontal ,IconUser ,IconHome, IconSearch, IconBell, IconMail, IconNotes, IconBookmark, IconUsers } from '@tabler/icons-react'

export default function LeftSide ({
    userFullName,
    userName,
    avatarUrl,
  }: {
    userFullName: string
    userName: string
    avatarUrl: string
  }) {

    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {

        if (dropdownOpen) {
          setDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownOpen]);

    const handleDropdown = () => {
      // Cambiar el estado de dropdownOpen al hacer clic en el botón
      setDropdownOpen(!dropdownOpen);
    };


    const buttons = [
      { icon: <IconHome className='leftButtonssvg' />, text: 'Home' },
      { icon: <IconSearch className='leftButtonssvg' />, text: 'Search' },
      { icon: <IconBell className='leftButtonssvg' />, text: 'Notifications' },
      { icon: <IconMail className='leftButtonssvg' />, text: 'Messages' },
      { icon: <IconNotes className='leftButtonssvg' />, text: 'Lists' },
      { icon: <IconBrandX className='leftButtonssvg' />, text: 'Premium' },
      { icon: <IconUser className='leftButtonssvg' />, text: 'Profile' },
      { icon: <IconBookmark className='leftButtonssvg' />, text: 'Bookmarks' },
      { icon: <IconUsers className='leftButtonssvg' />, text: 'Communities' },
    ];

    const altButtons = [
      { icon: <IconCashBanknote className='leftButtonssvg' />, text: 'MOnetization' },
      { icon: <IconVip className='leftButtonssvg' />, text: 'Pro' },
      { icon: <IconExternalLink  className='leftButtonssvg' />, text: 'Ads' },
      { icon: <IconSettings className='leftButtonssvg' />, text: 'Settings and privacy' },
    ]

    return (
        <div className="leftSide">
          <div className='justify-end'>
            <div className="flex">
              <button className="iconButton">
                <IconBrandX className='myLinks' />
              </button>
              <button className="iconButton">
                <a href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/" target="_blank" rel="noopener noreferrer">
                  <IconBrandLinkedin className='myLinks' />
                </a>
              </button>
              <button className="iconButton">
                <a href="https://github.com/RaulCDev" target="_blank" rel="noopener noreferrer">
                  <IconBrandGithub className='myLinks' />
                </a>
              </button>
            </div>
            {buttons.map((button, index) => (
              <button key={index} className='leftButtons rounded-full'>
                {button.icon}
                <span className="buttontext">{button.text}</span>
              </button>
            ))}
            <button onClick={handleDropdown} className='leftButtons rounded-full'>
              <IconDotsCircleHorizontal className='leftButtonssvg' />
              <span className="buttontext">More</span>
            </button>
            {dropdownOpen && <div className="overlay" />}
            {dropdownOpen && (
              <div className="dropdown" id="dropdown">
                <div className="dropdown-content">
                  {altButtons.map((button, index) => (
                    <button key={index} className='leftButtons rounded-full'>
                      {button.icon}
                      <span className="buttontext">{button.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button className='leftPostButton rounded-full'>Post</button>
            <button className="leftButtons container-flex rounded-full max-w-[250px]">
              <Avatar radius="full" size="md" src={avatarUrl} />
              <div className="flex flex-col gap-1 items-start justify-center ml-2">
                <h4 className="text-small font-semibold leading-none text-default-600">{userFullName}</h4>
                <h5 className="text-small tracking-tight text-default-400">@{userName}</h5>
              </div>
              <IconDots className='leftButtonssvg ml-16' />
            </button>
          </div>
        </div>
    )
  }