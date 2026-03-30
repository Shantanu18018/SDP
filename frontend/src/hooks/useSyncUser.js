import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axiosInstance from "../lib/axios";

export const useSyncUser = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        await axiosInstance.post("/users/sync", {
          clerkId: user.id,
          name: user.fullName || user.firstName || "Anonymous User",
          email: user.primaryEmailAddress?.emailAddress,
          profileImage: user.imageUrl,
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);
};
