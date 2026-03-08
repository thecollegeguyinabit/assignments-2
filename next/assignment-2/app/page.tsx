import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import { IBlog } from "@/types";


export default async function Page() {

    const data = await fetch(`${process.env.NEXT_URL}/api/blog/`);
    const response = await data.json();
    const blogs: IBlog[] = response.data;
  return(
    <>
      {/* header */}
      <Header />
      {/* main section */}
      <MainContent blogs={blogs}/>
    </>
  );
}