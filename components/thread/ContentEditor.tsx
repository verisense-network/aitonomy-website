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
  InsertImage,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";
import { twMerge } from "tailwind-merge";
import AddImage from "../mdxEditor/AddImage";

interface EditorProps extends MDXEditorProps {
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
}

export default function ContentEditor({ editorRef, ...props }: EditorProps) {
  return (
    <MDXEditor
      plugins={[
        toolbarPlugin({
          toolbarClassName: "my-classname",
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <AddImage />
            </>
          ),
        }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        imagePlugin(),
      ]}
      {...props}
      ref={editorRef}
      contentEditableClassName={twMerge(
        "prose z-20",
        props.contentEditableClassName
      )}
    />
  );
}
