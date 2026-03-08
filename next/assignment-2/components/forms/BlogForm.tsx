"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { TipTapEditor } from "../editor/TipTapEditor";
import z from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {useSession} from "next-auth/react";

const blogSchema = z.object({
    title: z.string().min(5, "Title atleast more than 5 characters"),
    slug: z.string(),
    category: z.string().optional(),
    content: z.string(),
});


type BlogFormProps = {
    initialData?: z.infer<typeof blogSchema>;
    mode: "add" | "edit"
}
/**
 * form contain
 * title 
 * slug generated from title
 * content
 * 
 */
export function BlogForm({initialData, mode}: BlogFormProps) {

    const router = useRouter();
    const {data:session} =  useSession();

    const isEditMode = mode === "edit" &&  Boolean(initialData);
    
    const form = useForm<z.infer<typeof blogSchema>>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title:   initialData?.title   ?? '',
            slug:    initialData?.slug    ?? '',
            category:    initialData?.category    ?? '',
            content: initialData?.content ?? '',
        }
    });
    const title = form.watch("title");
   
    useEffect(() => {
        const generatedSlug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, "-");
        form.setValue("slug", generatedSlug, {shouldValidate: false});
    }, [title]);

    async function formSubmit(formData: z.infer<typeof blogSchema>){

        try {
            if(isEditMode){
                // patch request to update blog
                const response = await fetch(`/api/blog/${initialData!.slug}`,{
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
                const res = await response.json();
                if(!res.success) throw new Error(res.error ?? 'failed to update blog');
                
                router.push(`blog/${formData.slug}`);
                
            } else {
                //post request for create blog
                const { title, slug, category, content} = formData;
                const response = await fetch('/api/blog', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({title, slug, category, content, author: session?.user?.name})
                }); 
                const res = await response.json();
                
                if(!res.success) throw new Error(res.error ?? 'failed to create blog');
                form.reset();
                router.push("/");
            }
        } catch (error) {
            console.error("Failed to create error blogForm", error);
        }
    }

    return(     
        <Card>
            <CardContent>
                <form onSubmit={form.handleSubmit(formSubmit)}>
                    <FieldGroup>
                        {/* title */}
                        <Controller 
                            name="title"
                            control={form.control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Title *</FieldLabel>
                                    <Input 
                                        {...field}
                                        id={field.name}
                                        type="text"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Title of blog"
                                        required
                                        />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}  
                        />
                        <Controller 
                            name="slug"
                            control={form.control}
                            render={({field}) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                                    <Input 
                                        {...field}
                                        id={field.name}
                                        type="text"
                                        readOnly
                                        className="bg-muted text-muted-foreground cursor-not-allowed"
                                    />
                                    <FieldDescription>Slug field is readonly </FieldDescription>
                                </Field>
                            )}  
                        />
                        <Controller 
                            name="category"
                            control={form.control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                                    <Input 
                                        {...field}
                                        id={field.name}
                                        type="text"
                                        aria-invalid={fieldState.invalid}
                                        />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </Field>
                            )}
                        />
                        <Controller 
                            name="content"
                            control={form.control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                                    <TipTapEditor
                                        content={field.value}
                                        onChange={(content: string) => form.setValue("content", content)}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    <FieldDescription>Use # for H1, ## for H2, ### for H3.</FieldDescription>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <CardFooter className="mt-5 p-0 flex gap-3">
                        <Button type="button" variant="outline" onClick={() => router.push("/")}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>
    );
}