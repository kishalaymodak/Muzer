import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});
export async function POST(req: NextRequest) {
  const seassion = await getServerSession();
  if (!seassion?.user?.email) {
    return NextResponse.json(
      {
        message: "Unauthentiated",
      },
      {
        status: 403,
      }
    );
  }
  const user = await prisma.user.findFirst({
    where: {
      email: seassion.user.email,
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
  try {
    const data = UpvoteSchema.parse(await req.json());
    await prisma.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });
    return NextResponse.json({
      message: "Done",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Errorn while upvorting",
      },
      {
        status: 403,
      }
    );
  }
}
