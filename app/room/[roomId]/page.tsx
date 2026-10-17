import type { Metadata } from "next";
import { RoomClient } from "@/components/RoomClient";

export const metadata: Metadata = { title: "convoTalk", robots: { index: false } };

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <RoomClient roomId={roomId} />;
}
