import { Schema, model, Document, Types } from "mongoose";

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>("Task", taskSchema);

