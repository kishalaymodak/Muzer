import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});
export async function POST(req: NextRequest) {
  const seassion = await getServerSession();
  console.log(seassion);

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
    console.log(user.id);

    const data = UpvoteSchema.parse(await req.json());
    console.log(data.streamId);
    const res = await prisma.upvote.create({
      data: {
        userId: user.id,
        streamId: data.streamId,
      },
    });
    console.log(res);

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
