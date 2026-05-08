import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
    },
    emailIndex: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Student", studentSchema);
