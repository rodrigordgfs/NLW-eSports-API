import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { convertHourStringToMinutes } from "./utils/convertHourStringToMinute";
import { convertMinuteToHourString } from "./utils/convertMinuteToHourString";

const app = express();
app.use(express.json());
app.use(cors());
const prisma = new PrismaClient({ log: ["query"] });

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });
  return res.json(games.map);
});

app.post("/games/:gameId/ads", async (req, res) => {
  const gameId: string = req.params.gameId;
  const body: any = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId: gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    },
  });

  return res.status(201).json(ad);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId: gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.json(
    ads.map((ad) => ({
      ...ad,
      weekDays: ad.weekDays.split(","),
      hourStart: convertMinuteToHourString(ad.hourStart),
      hourEnd: convertMinuteToHourString(ad.hourEnd),
    }))
  );
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    where: {
      id: adId,
    },
  });
  return res.json({
    discord: ad.discord,
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
