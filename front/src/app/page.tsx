"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import {
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import { useAuth } from "@/components/AuthProvider";

const LoginContent = () => {
  const [isStarting, setIsStarting] = useState(false);
  const { startGuestSession } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setIsStarting(true);
    try {
      await startGuestSession(true);
      router.push("/home");
    } catch (error) {
      console.error("Unable to start guest session:", error);
      setIsStarting(false);
    }
  };

  return (
    <>
      <div className="bigLoginContainer">
        <div className="main_text">
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
            LogIn (No credentials)
          </Button>
        </div>
      </div>
    </>
  );
};

export default LoginContent;
