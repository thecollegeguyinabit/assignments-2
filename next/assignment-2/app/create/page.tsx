
import { BlogForm } from "@/components/forms/BlogForm";

export default function CreateBlog() {
    return(
        <div className="flex min-h-svh w-full justify-center p-6 md:p-10 bg-muted">
            <div className="w-full max-w-4xl min-w-sm">
                <BlogForm mode="add"/>
            </div>
        </div>
    );
}