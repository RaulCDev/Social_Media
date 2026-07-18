"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Avatar } from "@nextui-org/react";
import {
  IconSettings,
  IconExternalLink,
  IconVip,
  IconCashBanknote,
  IconBrandLinkedin,
  IconBrandGithub,
  IconDots,
  IconBrandX,
  IconDotsCircleHorizontal,
  IconUser,
  IconHome,
  IconSearch,
  IconBell,
  IconMail,
  IconNotes,
  IconBookmark,
  IconUsers,
} from "@tabler/icons-react";
import TextAreaPost from "./TextArea-Post";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api-client";
import { useSessionMutation } from "@/components/AuthProvider";

export type SidebarSection =
  | "Search"
  | "Notifications"
  | "Messages"
  | "Lists"
  | "Premium"
  | "Profile"
  | "Bookmarks"
  | "Communities"
  | null;

export default function LeftSide({
  userFullName,
  userName,
  activeSection = null,
  onSectionChange = () => undefined,
}: {
  userFullName: string;
  userName: string;
  activeSection?: SidebarSection;
  onSectionChange?: (section: SidebarSection) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isWriteTextOpen, setIsWriteTextOpen] = useState(false);
  const runMutation = useSessionMutation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleWriteTextButtonClick = () => {
    setIsWriteTextOpen(!isWriteTextOpen);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handlePostClick = async (content: string) => {
    const postData = {
      content: content,
    };

    try {
      await runMutation(() =>
        apiFetch("/post", {
          method: "POST",
          body: JSON.stringify(postData),
        }),
      );
      toast.success("Post created successfully", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsWriteTextOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buttons: Array<{
    icon: ReactNode;
    text: string;
    section: SidebarSection;
  }> = [
    { icon: <IconHome className="leftButtonssvg" />, text: "Home", section: null },
    { icon: <IconSearch className="leftButtonssvg" />, text: "Search", section: "Search" },
    { icon: <IconBell className="leftButtonssvg" />, text: "Notifications", section: "Notifications" },
    { icon: <IconMail className="leftButtonssvg" />, text: "Messages", section: "Messages" },
    { icon: <IconNotes className="leftButtonssvg" />, text: "Lists", section: "Lists" },
    { icon: <IconBrandX className="leftButtonssvg" />, text: "Premium", section: "Premium" },
    { icon: <IconUser className="leftButtonssvg" />, text: "Profile", section: "Profile" },
    { icon: <IconBookmark className="leftButtonssvg" />, text: "Bookmarks", section: "Bookmarks" },
    { icon: <IconUsers className="leftButtonssvg" />, text: "Communities", section: "Communities" },
  ];

  const altButtons = [
    {
      icon: <IconCashBanknote className="leftButtonssvg" />,
      text: "Monetization",
    },
    { icon: <IconVip className="leftButtonssvg" />, text: "Pro" },
    { icon: <IconExternalLink className="leftButtonssvg" />, text: "Ads" },
    {
      icon: <IconSettings className="leftButtonssvg" />,
      text: "Settings and privacy",
    },
  ];

  return (
    <div className="leftSide">
      <div className="justify-end">
        <div className="flex">
          <button className="iconButton">
            <IconBrandX className="myLinks" />
          </button>
          <button className="iconButton">
            <a
              href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/"
              target="_blank"
              rel="noopener noreferrer">
              <IconBrandLinkedin className="myLinks" />
            </a>
          </button>
          <button className="iconButton">
            <a
              href="https://github.com/RaulCDev"
              target="_blank"
              rel="noopener noreferrer">
              <IconBrandGithub className="myLinks" />
            </a>
          </button>
        </div>
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`leftButtons rounded-full ${
              activeSection === button.section ? "leftButtonActive" : ""
            }`}
            aria-current={activeSection === button.section ? "page" : undefined}
            onClick={() => onSectionChange(button.section)}>
            {button.icon}
            <span className="buttontext">{button.text}</span>
          </button>
        ))}
        <div className="moreMenuAnchor">
          <button onClick={handleDropdown} className="leftButtons rounded-full">
            <IconDotsCircleHorizontal className="leftButtonssvg" />
            <span className="buttontext">More</span>
          </button>
          {dropdownOpen && <div className="overlay" />}
          {dropdownOpen && (
            <div className="dropdown" id="dropdown">
              <div className="dropdown-content">
                {altButtons.map((button, index) => (
                  <button key={index} className="leftButtons rounded-full">
                    {button.icon}
                    <span className="buttontext">{button.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          className="leftPostButton rounded-full"
          onClick={handleWriteTextButtonClick}>
          Post
        </button>
        {isWriteTextOpen && <div className="overlay" />}
        {isWriteTextOpen && (
          <div
            className="container-dropdown-comment"
            onClick={(e) => {
              e.preventDefault();
            }}
            ref={dropdownRef}>
            <TextAreaPost
              userName="userName"
              avatarUrl={`https://github.com/${userName}.png`}
              handlePost={handlePostClick}
            />
          </div>
        )}
        <button className="leftButtons container-flex rounded-full max-w-[250px]">
          <Avatar
            radius="full"
            size="md"
            src={`https://github.com/${userName}.png`}
          />
          <div className="flex flex-col gap-1 items-start justify-center ml-2">
            <h4 className="text-small font-semibold leading-none text-default-600">
              {userFullName}
            </h4>
            <h5 className="text-small tracking-tight text-default-400">
              @{userName}
            </h5>
          </div>
          <IconDots className="leftButtonssvg ml-16" />
        </button>
      </div>
    </div>
  );
}
