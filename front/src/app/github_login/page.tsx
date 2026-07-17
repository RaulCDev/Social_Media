import { redirect } from "next/navigation";

export default function LegacyGithubLoginRedirect() {
  redirect("/");
}
