"use client";

import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { ModeToggle } from "../ThemeToggle";

import Link from "next/link";
import { useSession} from "next-auth/react";
import { signOut } from "next-auth/react";   
import { admin } from "@/auth";

export default   function() {
    const {data:session} =  useSession();
    return(
        <header className="w-full my-4">
            <div className="container px-2 md:mx-auto">
                <div className="mb-3 px-4 flex justify-between">
                    <h3 className="text-xl md:text-2xl font-semibold">Blog</h3>
                    <div className="flex gap-2">
                        <ModeToggle />
                        {
                            admin.email === session?.user?.email &&
                            <Link href="/dashboard">
                                <Button type="button" >Dashboard</Button>
                            </Link>
                        }
                        { Boolean(session?.user) &&
                            <div className="flex gap-2">
                                    <Button type="button" asChild>
                                        <Link href="/create">Create</Link>
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => signOut()}> <LogOut /></Button>
                            </div>
                         } 
                    </div>
                </div>
                <Separator />
            </div>
        </header>
    );
}