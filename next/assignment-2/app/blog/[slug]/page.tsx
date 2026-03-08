import { formatDate } from '@/lib/utils';


export default async function page({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const json = await fetch(`${process.env.NEXT_URL}/api/blog/${slug}`).then((res) => res.json());
    const blog = json.success ? json.data : null;
  return (
    <div className='px-96'>
        <header className='mt-10 px-10 space-y-8 '>
            <h1 className='text-3xl md:text-8xl font-bold'>{blog.title}</h1>
            <div className='flex gap-5 items-baseline'>
                <p className='text-lg font-light'>By {blog.author}</p>
                <span className='flex gap-1 self-end mb-px'>
                    {
                        blog.createdAt !== blog.updatedAt ? (
                            <p>Updated on {formatDate(blog.updatedAt)}</p>
                        ) : (
                            <p>Published on {formatDate(blog.createdAt)}</p>
                        )
                    }
                </span>
            </div>
        </header>
        <main className='px-4 py-15'>
            <div 
                className="prose-headings:my-5 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-2 prose-p:font-extralight prose-p:text-justify prose-pre:my-2 prose-img:mt-5 max-w-none "
                dangerouslySetInnerHTML={{__html: blog.content}}/>
        </main>
    </div>
  )
}
