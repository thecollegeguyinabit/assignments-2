import { Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  category?: string;
  author?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}