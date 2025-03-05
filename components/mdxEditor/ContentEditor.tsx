import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  imagePlugin,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  linkPlugin,
  codeBlockPlugin,
  InsertCodeBlock,
  codeMirrorPlugin,
  linkDialogPlugin,
} from "@mdxeditor/editor";
import { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";
import { twMerge } from "tailwind-merge";
import AddImage from "./AddImage";

interface EditorProps extends MDXEditorProps {
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
}

export default function ContentEditor({ editorRef, ...props }: EditorProps) {
  return (
    <MDXEditor
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <AddImage />
              <CreateLink />
              <InsertCodeBlock />
            </>
          ),
        }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        imagePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            rust: "Rust",
            ts: "TypeScript",
            js: "JavaScript",
            c: "C",
            cpp: "C++",
            css: "CSS",
            html: "HTML",
            mdx: "MDX",
          },
        }),
      ]}
      {...props}
      ref={editorRef}
      contentEditableClassName={twMerge(
        "prose w-full max-w-full",
        props.contentEditableClassName
      )}
    />
  );
}
