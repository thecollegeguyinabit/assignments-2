import Dashboard from "@/components/layout/Dashboard";
import { IBlog } from "@/types";


export default async function () {
  const data = await fetch(`${process.env.NEXT_URL}/api/blog/`);
  const response = await data.json();
  const blogs: IBlog[] = response.data;

  return (
    <div className="flex min-h-svh w-full  justify-center p-6  md:p-10 bg-muted">
      <div className="w-full max-w-4xl min-w-xs">
        <Dashboard blogs={blogs} />
      </div>
    </div>
  );
}
