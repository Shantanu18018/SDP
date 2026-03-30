import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "intervuex" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const name = `${first_name || ""} ${last_name || ""}`.trim() || "Anonymous User";
    const email = email_addresses?.[0]?.email_address;

    const userData = {
      clerkId: id,
      email,
      name,
      profileImage: image_url || "",
    };

    await User.findOneAndUpdate(
      { clerkId: id },
      { $set: userData },
      { upsert: true, new: true }
    );

    await upsertStreamUser({
      id: userData.clerkId.toString(),
      name: userData.name,
      image: userData.profileImage,
    });
  }
);



const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];