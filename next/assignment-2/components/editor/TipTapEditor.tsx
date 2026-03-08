"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import * as z from "zod/v3";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Bold, Code2, Heading1, Heading2, Heading3, ImageIcon, Italic, List, ListOrdered, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type TiptapEditorProps ={
    content: string;
    onChange: (content: string) => void
}
const imageFormSchema = z.object({
  src: z.string().url({ message: "Please enter a valid URL." }),
  alt: z.string().min(1, { message: "Alt text is required." }),
  title: z.string().optional(),
});

export function TipTapEditor({ content, onChange}: TiptapEditorProps) {

    const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
    
    const imageForm = useForm<z.infer<typeof imageFormSchema>>({
        resolver: zodResolver(imageFormSchema),
        defaultValues: { src: '', alt: '', title: ''}
    });

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {levels: [1,2,3], HTMLAttributes: {class: 'font-semibold ml-2 text-xl'}},
                bold: {HTMLAttributes: {class: 'font-bold'}},
                italic: {HTMLAttributes: {class: 'font-italic'}},
                codeBlock: {HTMLAttributes: {class: 'bg-neutral-600 text-white w-3/5 p-2 my-4 rounder-lg'}},
                bulletList: {HTMLAttributes: {class: 'list-disc ml-6'}},
                orderedList: {HTMLAttributes: {class: 'list-decimal ml-6'}}
            }),
            Image.configure({HTMLAttributes: {class: 'max-w-full max-h-auto rounded-lg'}}),
            // Link.configure({
            //     HTMLAttributes: {class: 'text-violet-600 underline hover:text-violet-600/80 cursor-pointer'},
            //     openOnClick: true,
            //     linkOnPaste: true
            // }),
        ],
    content,
    onUpdate: ({ editor })=> { onChange(editor.getHTML()); },
    editorProps: { attributes: {class: 'prose-red m-5 p-4 focus:outline-none min-h-[400px]'} }
    });

    async function onImageForSubmit(values: z.infer<typeof imageFormSchema>) {
        if(editor?.isActive('image')) {
            editor.chain().focus().updateAttributes('image',values).run();
        } else {
            editor?.chain().focus().setImage(values).run();
        }
        setIsImageDialogOpen(false);
        imageForm.reset();
    };

    function openImageDialog() {
        if(editor?.isActive('image')) {
            const currentAttrs = editor.getAttributes('image');
            imageForm.reset(currentAttrs);
        } else {
            imageForm.reset();
        }
        setIsImageDialogOpen(true);
    }

    if(!editor) {
        return null;
    }

    return (
        <div className="border rounded-md overflow-hidden">
            {/* Toolbar */}
            <div className="bg-muted/50 border-b p-2 flex flex-wrap gap-1">
                {/* Heading */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                    className={editor.isActive('heading', {level: 1}) ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><Heading1 className="h-4 w-4"/></Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                    className={editor.isActive('heading', {level: 2}) ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><Heading2 className="h-4 w-4"/></Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                    className={editor.isActive('heading', {level: 3}) ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><Heading3 className="h-4 w-4"/></Button>
                
                <Separator className="mx-1 h-6"  orientation="vertical"/>
                
                {/* Bold */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><Bold className="h-4 w-4"/></Button>

                {/* Italic */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><Italic className="h-4 w-4"/></Button>

                <Separator className="mx-1 h-6 " orientation="vertical"/>

                {/* Lists */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><List className="h-4 w-4"/></Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><ListOrdered className="h-4 w-4"/></Button>

                <Separator className="mx-1 h-6 " orientation="vertical"/>

                {/* CodeBlock */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive('codeBlock') ? "bg-zinc-200 dark:bg-zinc-700" : ""}
                ><Code2 className="h-4 w-4"/></Button>

                <Separator className="mx-1 h-6 " orientation="vertical"/>

                {/* Image Dialog */}
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={openImageDialog}
                        ><ImageIcon className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    {/* TODO: change the max-w-[425px] for responsive */}
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editor.isActive('image') ? "Edit Image" : "Add Image"}</DialogTitle>
                            <DialogDescription>Upload a new image or provide a URL, Make sure to add alt text for accessibility</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={imageForm.handleSubmit(onImageForSubmit)}> 
                            <FieldGroup>
                                <Controller
                                    name="src"
                                    control={imageForm.control}
                                    render={({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Image</FieldLabel>
                                            <Input 
                                                {...field}
                                                placeholder="Image url"
                                                required
                                                aria-invalid={fieldState.invalid}
                                                />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                        </Field>
                                    )}
                                /> 
                                <Controller
                                    name="alt"
                                    control={imageForm.control}
                                    render = {({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Alt text</FieldLabel>
                                            <Input {...field} required aria-invalid={fieldState.invalid} />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                        </Field>
                                    )}
                                />
                                <Controller 
                                    name="title"
                                    control={imageForm.control}
                                    render={({field, fieldState}) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                            <Input {...field} placeholder="Image Title (Optional)" />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">{editor.isActive('image') ? "Update" : "Add"}</Button>
                        </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/*  remove image button - only visible if image is selected */}
                { editor.isActive('image') && (
                    <>
                        <Separator orientation="vertical" className="mx-1 h-6" />
                        <Button 
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().setImage({src:"", alt: "", title: ""}).run()}
                        ><Trash2 className="h-4 w-4 text-red-400" /></Button>
                    </>
                )}
            </div>
            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}