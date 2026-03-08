"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "../ui/dropdown-menu";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "../ui/table";
import { IBlog } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function Dashboard({ blogs }: { blogs: IBlog[] }) {
  const router = useRouter();
  function handleEditBlog(slug: string) {
    // navigate to blog page
     router.push(`edit/${slug}`);
  }
   async function handleDeleteBlog(slug: string) {
    try {
      const res = await fetch(`/api/blog/${slug}`,{method: "DELETE"});
      router.refresh();
    } catch (error) {
      console.error("Failed to delete blog", error);
    }
  }
  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle>
          <Link href="/">
            <Button className="mr-4" size="sm">Home</Button>
          </Link>
          Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[80vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
           { blogs.map((value:IBlog, index: number,) => (
               <TableRow key={index}>
              <TableCell className="font-medium">{value.title}</TableCell>
              {/* tags can be array */}
              <TableCell>
                <Badge>{value.category}</Badge>
              </TableCell>
              <TableCell>
                {value.author}
              </TableCell>
              <TableCell>
                {formatDate(value.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditBlog(`${value.slug}`)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteBlog(`${value.slug}`)}
                      >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            ))
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
