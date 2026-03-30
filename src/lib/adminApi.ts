import { cookies } from "next/headers";
import { getAdminSession, verifySessionValue } from "@/lib/adminAuth";

export const isAdminRequest = async () => {
  const store = await cookies();
  const session = getAdminSession(store);
  return verifySessionValue(session);
};
