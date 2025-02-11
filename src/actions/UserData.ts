import prisma from "@/lib/db";

async function UserData(email: string) {
  const res = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  console.log(res);

  return res;
}

UserData("kishalaymodak2003@gamil.com");

export default UserData;
