import {dbConnect} from "@/lib/db/db";
import Blogs from "@/lib/db/models/Blog";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
   try {
        await dbConnect();
        const blogs = await Blogs.find().sort({publishDate: -1}).lean();
        return NextResponse.json({success: true, data:blogs}, {status: 200});
    } catch (error) {
        console.error('get /api/blogs ', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, slug, category, content, author} = body;

        if(!title || !slug || !content){
            return NextResponse.json({success: false, error: "title field is empty, it must required"}, {status: 400});
        }
        const existing = await Blogs.findOne({title});
        if(existing){
            return NextResponse.json({success: false, error: "ALready blog exist with blog title"}, {status: 409});
        }

        const blog = await Blogs.create({title, slug, category, content, author});
        return NextResponse.json({success: true, data: blog}, {status: 201});
    } catch (error) {
        console.error("post /api/blog", error);
        return NextResponse.json({success: false, error: "Failed to create blog"}, {status: 500});
    }
}