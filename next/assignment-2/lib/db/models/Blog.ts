import { model, models, Schema } from "mongoose";
import { IBlog } from "@/types"

const blogSchema = new Schema<IBlog>({
    title: { type: String, required: true},
    slug: { type: String, required: true},
    category: { type: String, },
    content: {type: String, required: true},
    author: { type: String}
}, {timestamps: true});

blogSchema.index({slug: 1});

export default models.Blogs || model<IBlog>("Blogs", blogSchema);