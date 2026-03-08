import { IBlog } from "@/types";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ({ blogs }: { blogs: IBlog[] }) {

  return (
    <main>
      {/* search section */}
      <div className="h-[25svh]  flex flex-col gap-5 justify-center items-center">
        {/* title  */}
        <h3 className="text-6xl font-bold">Blog</h3>
      </div>

      {/* blogs section */}
      <div className="h-[60svh] w-full bg-neutral-700 flex flex-col gap-2 items-center pt-4 ">
        {blogs.map((value: IBlog, index: number, array: IBlog[]) => (
          <div className="w-2/3 md:w-1/2 flex gap-3 p-2" key={index}>
            <Link href={`/blog/${value.slug}`} className="w-full">
              <Card >
                <CardHeader>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge>{value.category}</Badge>
                  <div className="flex gap-2 justify-between">
                    <p className="text-sm font-medium">By {value.author}</p>
                    {value.updatedAt !== value.createdAt ? (
                      <p className="text-sm font-light">
                        Updated on {formatDate(value.updatedAt)}
                      </p>
                    ) : (
                      <p className="text-sm font-light">
                        Published on {formatDate(value.createdAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
