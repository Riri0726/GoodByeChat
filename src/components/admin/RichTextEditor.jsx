import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useCallback, useRef } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList,
  FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiLink, FiUpload
} from 'react-icons/fi';
import {
  LuHeading1, LuHeading2, LuHeading3,
  LuListOrdered, LuQuote, LuUndo, LuRedo
} from 'react-icons/lu';
import mammoth from 'mammoth';

function ToolbarButton({ onClick, isActive, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={isActive ? 'is-active' : ''}
      title={title}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Write your heartfelt message here...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const html = text
          .split('\n\n')
          .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
          .join('');
        editor?.commands.setContent(html);
        onChange(html);
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editor?.commands.setContent(result.value);
        onChange(result.value);
      }
    } catch (err) {
      console.error('File import error:', err);
      alert('Failed to import file. Please try again.');
    }

    e.target.value = '';
  }, [editor, onChange]);

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className="editor-container"
      onClick={() => {
        if (editor && !editor.isFocused) {
          editor.commands.focus();
        }
      }}
    >
      <div className="editor-toolbar" onClick={(e) => e.stopPropagation()}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <FiBold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <FiItalic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <FiUnderline />
        </ToolbarButton>

        <div className="divider" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <LuHeading1 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <LuHeading2 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <LuHeading3 />
        </ToolbarButton>

        <div className="divider" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <FiList />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <LuListOrdered />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <LuQuote />
        </ToolbarButton>

        <div className="divider" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <FiAlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <FiAlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <FiAlignRight />
        </ToolbarButton>

        <div className="divider" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Add Link">
          <FiLink />
        </ToolbarButton>

        <div className="divider" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <LuUndo />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <LuRedo />
        </ToolbarButton>

        <div className="divider" />

        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Import .txt or .docx"
        >
          <FiUpload />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />
      </div>

      <div
        className="editor-content"
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
