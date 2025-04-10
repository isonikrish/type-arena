"use client";

import { Player } from "@/lib/types";
import { Card } from "./ui/card";

export default function LeaderboardCard({
  player,
  rank,
}: {
  player: Player;
  rank: number;
}) {
  return (
    <Card className="w-full flex p-5 gap-5">
      <div className="text-xl"># {rank}</div>
      <div className="text-xl">{player.name}</div>
      <div className="ml-auto text-xl">{player.score}</div>
    </Card>
  );
}