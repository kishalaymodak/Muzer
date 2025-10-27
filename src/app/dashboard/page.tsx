import Streams from "@/components/Streams";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserData from "@/actions/UserData";
// @ts-expect-error: CSS module side-effect import without type declarations
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export default async function page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }
  const res = await UserData(session.user?.email || "");
  if (!res?.id) return <>user not found</>;

  return <Streams playVideo={true} creatorId={res?.id} />;
}
