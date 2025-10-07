import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Enable2FA } from "@/components/auth/Enable2FA";

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session){
    redirect('/signin');
  }

  if(session.user.twoFactorEnabled){
    redirect('/');
  }

  return(
    <Enable2FA />
  );
};

export default page;