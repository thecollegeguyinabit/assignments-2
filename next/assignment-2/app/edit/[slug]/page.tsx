import { BlogForm } from "@/components/forms/BlogForm";
import { notFound } from "next/navigation";

async function getBlog(slug: string) {
  const res = await fetch(`${process.env.NEXT_URL}/api/blog/${slug}`);
  const json = await res.json();
  return json.success ? json.data : null;
}

export default async function ({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  
  if (!blog) notFound();
  return (
    <div className="flex min-h-svh w-full justify-center p-6 md:p-10 bg-muted">
      <div className="w-full max-w-4xl min-w-sm">
        <BlogForm mode="edit" initialData={blog} />
      </div>
    </div>
  );
}
