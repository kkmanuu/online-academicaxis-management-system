const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const normalizeRoles = async () => {
  try {
    await connectDB();

    // Find all users with non-lowercase role values
    const usersWithMixedCase = await User.find({
      role: { $regex: /^[A-Z]/ } // Starts with uppercase
    });

    if (usersWithMixedCase.length === 0) {
      console.log("✅ All role values are already normalized to lowercase.");
      process.exit(0);
    }

    console.log(`Found ${usersWithMixedCase.length} users with non-lowercase roles:`);
    usersWithMixedCase.forEach(u => {
      console.log(`  - ${u.email}: role = "${u.role}"`);
    });

    // Update all to lowercase
    for (const user of usersWithMixedCase) {
      user.role = user.role.toLowerCase();
      await user.save();
      console.log(`  ✓ Updated ${user.email} to role="${user.role}"`);
    }

    console.log("\n✅ All roles normalized to lowercase successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error normalizing roles:", error);
    process.exit(1);
  }
};

normalizeRoles();
