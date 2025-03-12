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
import "./dark-editor.css";
import { twMerge } from "tailwind-merge";
import AddImage from "./AddImage";
import { useTheme } from "next-themes";
import AddMention from "./AddMention";
import { basicDark } from "cm6-theme-basic-dark";

interface EditorProps extends MDXEditorProps {
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
}

export default function ContentEditor({ editorRef, ...props }: EditorProps) {
  const { theme } = useTheme();
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
              <AddMention />
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
        codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
        codeMirrorPlugin({
          codeMirrorExtensions: [basicDark],
          autoLoadLanguageSupport: true,
          codeBlockLanguages: {
            txt: "Text",
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
      className={twMerge(
        `w-full overflow-hidden prose max-w-none dark:prose-invert border-1 border-zinc-200 dark:border-zinc-800 ${
          theme === "dark" ? "dark-theme dark-editor" : ""
        }`,
        props.className
      )}
      contentEditableClassName={twMerge(
        `w-full max-w-full`,
        props.contentEditableClassName
      )}
    />
  );
}
