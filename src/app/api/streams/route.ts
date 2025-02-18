import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
// @ts-expect-error ytchapi api is not Type Compartable
import youtubesearchapi from "youtube-search-api";
import { getServerSession } from "next-auth";

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

    const extractedId = data.url.split("?v=")[1];
    const res = await youtubesearchapi.GetVideoDetails(extractedId);
    console.log(res);

    const thumbnail = res.thumbnail.thumbnails;
    thumbnail.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );

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
        bigImageUrl: String(thumbnail[thumbnail.length - 1].url) ?? "",
        smallImageUrl:
          String(
            thumbnail.length > 1
              ? thumbnail[thumbnail.length - 2].url
              : thumbnail[thumbnail.length - 1].url
          ) || "",
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
