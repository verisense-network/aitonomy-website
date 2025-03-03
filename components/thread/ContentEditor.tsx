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
} from "@mdxeditor/editor";
import { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";

interface EditorProps extends MDXEditorProps {
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
}

export default function ContentEditor({ editorRef, ...props }: EditorProps) {
  return (
    <MDXEditor
      contentEditableClassName="prose max-w-none"
      plugins={[
        toolbarPlugin({
          toolbarClassName: "my-classname",
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
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
    />
  );
}
