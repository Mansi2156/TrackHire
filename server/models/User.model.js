const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password hash by default
    },
    avatar: {
      type: String,
      default: "",
    },
    // Settings module additions (Profile tab) — not in the original field
    // list in docs/DATABASE_DESIGN.md, added here per the "update this
    // document first" rule. All optional; shown on the Settings > Profile
    // form alongside fullName/email.
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    // Settings module addition (Reminders tab) — in-app reminder
    // preferences only (no email reminders, out of MVP scope).
    reminders: {
      interviewReminderDays: {
        type: Number,
        enum: [0, 1, 2, 3], // 0 = same day
        default: 1,
      },
      followUpReminderDays: {
        type: Number,
        min: [1, "Follow-up reminder must be at least 1 day"],
        max: [60, "Follow-up reminder cannot exceed 60 days"],
        default: 7,
      },
    },
    // Settings module addition (Danger Zone) — soft delete. The user
    // document is kept (not removed) so related records (applications,
    // resumes, companies, interviews) never dangle; access is instead
    // blocked at the auth middleware for any user with isDeleted: true.
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash the password before saving, only if it was modified.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare a plain-text password with the stored hash.
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never leak the password hash if a document is serialized directly.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
