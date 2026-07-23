"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";
import { apiUrl } from "@/lib/api-client";

const oauthErrorMessages: Record<string, string> = {
  access_denied: "GitHub sign-in was cancelled.",
  invalid_request: "Your sign-in request expired. Please try again.",
  invalid_state: "Your sign-in request expired. Please try again.",
  verified_email_required: "Verify an email address on GitHub, then try again.",
  identity_conflict: "That email is already linked to another GitHub account.",
  provider_unavailable: "GitHub is unavailable right now. Please try again later.",
  token_exchange_failed: "GitHub is unavailable right now. Please try again later.",
  invalid_provider_response: "GitHub is unavailable right now. Please try again later.",
};

const fallbackOauthErrorMessage =
  "GitHub sign-in could not be completed. Please try again.";

const LoginContent = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    setOauthError(
      new URLSearchParams(window.location.search).get("oauth_error"),
    );
  }, []);

  const handleLogin = () => {
    setIsStarting(true);
    window.location.assign(apiUrl("/auth/github/start"));
  };

  return (
    <main className="bigLoginContainer">
      <section className="loginPanel" aria-labelledby="login-title">
        <h1 id="login-title" className="loginTitle">
          Social Media
        </h1>
        <Button
          onClick={handleLogin}
          isDisabled={isStarting}
          isLoading={isStarting}
          className="loginButton">
          <span>Sign in with GitHub</span>
          <IconBrandGithub className="loginButtonIcon" aria-hidden="true" />
        </Button>
        <div className="loginErrorSlot">
          {oauthError ? (
            <p role="alert" className="loginError">
              {oauthErrorMessages[oauthError] ?? fallbackOauthErrorMessage}
            </p>
          ) : null}
        </div>
        <nav className="loginLinks" aria-label="Personal links">
          <a
            className="loginLink"
            href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/"
            target="_blank"
            rel="noopener noreferrer">
            <IconBrandLinkedin className="loginLinkIcon" aria-hidden="true" />
            <span>LinkedIn</span>
          </a>
          <span className="loginLinksDivider" aria-hidden="true" />
          <a
            className="loginLink"
            href="https://github.com/RaulCDev"
            target="_blank"
            rel="noopener noreferrer">
            <IconBrandGithub className="loginLinkIcon" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </nav>
      </section>
    </main>
  );
};

export default LoginContent;
