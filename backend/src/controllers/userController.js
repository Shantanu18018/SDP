import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const { clerkId, email, name, profileImage } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({
        clerkId,
        name,
        email,
        profileImage: profileImage || "",
      });
    } else {
      user.name = name;
      user.email = email;
      user.profileImage = profileImage || user.profileImage;
      await user.save();
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in syncUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
