import { dbConnect } from "@/lib/db/db";
import Blog from "@/lib/db/models/Blog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, {params}: {params: {slug: string}} ): Promise<NextResponse> {
    try {
        await dbConnect();
        const { slug} = await params;
        const blog = await Blog.findOne({slug: slug}).lean();
        if(!blog){
            return NextResponse.json({success: false, error: "blog not found"}, {status: 404});
        }
        return NextResponse.json({success: true, data:blog},{status: 200});
    } catch (error) {
        console.error('get api/blog/[slug]', error);
        return NextResponse.json({success: false, error: 'Failed to fetch blog'}, {status: 500});
    }
}

export async function PATCH(req: NextRequest, {params}: {params: {slug: string}}): Promise<NextResponse> {
    try {
        await dbConnect();
        const body = await req.json();
        const {title, slug, category, content} = body;
        const updatedBlog = await Blog.findOneAndUpdate({slug: params.slug}, { $set: {title, slug, category, content}}, { new: true});
        if(!updatedBlog) {
            return NextResponse.json({success: false, error:"blog not found during update"}, {status: 404});
        }
        return NextResponse.json({success: true, data: updatedBlog, message: "Blog updated successfully"}, {status: 200});
    } catch (error) {
        console.error('patch /api/blogs/[slug]', error);
        return NextResponse.json({success: false, error: "Failed to update blog "}, {status: 500});
    }
}

export async function DELETE(_req: NextRequest, {params}: {params:{slug: string}}): Promise<NextResponse> {
    try {
        await dbConnect();
        const deleteBlog = await Blog.findOneAndDelete({slug: params.slug});
        if(!deleteBlog){
            return NextResponse.json({success: false, error: "blog not found during delete"}, {status: 404});
        }
        return NextResponse.json({success: true, message: "Blog deleted successfully"}, {status:200});
    } catch (error) {
        console.error('delete /api/blog/[slug]', error);
        return NextResponse.json({success: false, error: "Failed to delete blog"}, {status: 500});
    }
}