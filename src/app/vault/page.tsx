import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { VaultView } from "@/components/vault/VaultView";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const userId = session.session.userId;
  const twoFactorEnabled = session.user.twoFactorEnabled;

  return (
    <div>
        <VaultView userId={userId} twoFactorEnabled={twoFactorEnabled || false}/>
    </div>
  );
};

export default Page;
