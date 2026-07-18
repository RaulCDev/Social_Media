"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import {
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import { apiUrl } from "@/lib/api-client";

const LoginContent = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [oauthError, setOauthError] = useState(false);

  useEffect(() => {
    setOauthError(new URLSearchParams(window.location.search).has("oauth_error"));
  }, []);

  const handleLogin = () => {
    setIsStarting(true);
    window.location.assign(apiUrl("/auth/github/start"));
  };

  return (
    <>
      <div className="bigLoginContainer">
        <div className="main_text">
          <h1 className="loginTitle">Social Media</h1>
          <div className="loginIcons">
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
          <Button
            onClick={handleLogin}
            isDisabled={isStarting}
            isLoading={isStarting}
            className="text-xl">
            <span>LogIn with GitHub</span>
            <IconBrandGithub className="h-5 w-5" aria-hidden="true" />
          </Button>
          {oauthError ? (
            <p role="alert" className="mt-3 text-sm text-red-400">
              GitHub login could not be completed. Please try again.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default LoginContent;
