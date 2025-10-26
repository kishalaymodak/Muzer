import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

import { getServerSession } from "next-auth";
import { getVideoDetails } from "@/lib/Ytapi";

const MAX_QUEUE_LEN = 20;
const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYT = data.url.match(YT_REGEX);
    // console.log(isYT);

    if (!isYT) {
      return NextResponse.json(
        {
          message: "Wrong url id",
        },
        {
          status: 411,
        }
      );
    }

    const extractedId = isYT[1];
    // console.log("extractedId");
    // console.log(extractedId);
    const apikey = process.env.YT_API_KEY || "";

    const res = await getVideoDetails(extractedId, apikey);
    // console.log(res);

    // const res = await youtubesearchapi.GetVideoDetails(extractedId, {
    // key: apikey,
    // });

    // console.log("response");

    // console.log(res.thumbnail);

    const thumbnail = res.thumbnail;
    // console.log("thumbnails");
    // console.log(thumbnail?.high);

    // thumbnail.sort((a: { width: number }, b: { width: number }) =>
    //   a.width < b.width ? -1 : 1
    // );

    const existingActiveStream = await prisma.stream.count({
      where: {
        userId: data.creatorId,
      },
    });

    if (existingActiveStream > MAX_QUEUE_LEN) {
      return NextResponse.json(
        {
          message: "Already at limit",
        },
        {
          status: 411,
        }
      );
    }

    const streams = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: String(res.title) || "",
        bigImageUrl: String(thumbnail?.high) || "",
        smallImageUrl: String(thumbnail?.medium) || "",
        played: false,
        playedTs: new Date(),
        addedById: data.creatorId,
      },
    });
    return NextResponse.json({
      ...streams,
      hasUpvoted: false,
      upvotes: 0,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Error while adding stream",
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const session = await getServerSession();
  // TODO: You can get rid of the db call here
  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      }
    );
  }
  if (!creatorId) {
    return NextResponse.json(
      {
        message: "Error",
      },
      {
        status: 411,
      }
    );
  }
  const [streams, activeStream] = await Promise.all([
    await prisma.stream.findMany({
      where: {
        userId: creatorId,
        played: false,
      },
      include: {
        _count: {
          select: {
            upvots: true,
          },
        },
        upvots: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    prisma.currentStream.findFirst({
      where: {
        userId: creatorId,
      },
      include: {
        stream: true,
      },
    }),
  ]);
  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvots,
      haveUpvoted: rest.upvots.length ? true : false,
    })),
    activeStream,
  });
}
