import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET() {
  const seassion = await getServerSession();
  const user = await prisma.user.findFirst({
    where: {
      email: seassion?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthentiated",
      },
      {
        status: 403,
      }
    );
  }

  const Streams = await prisma.stream.findMany({
    where: {
      userId: user.id,
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
  });
  return NextResponse.json({
    Streams: Streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvots,
      haveUpvoted: rest.upvots.length ? true : false,
    })),
  });
}
