import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/core/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  className,
  disabled = false,
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  }, [executeCommand]);

  const ToolbarButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    isActive?: boolean;
  }> = ({ onClick, children, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled || readOnly}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors",
        isActive && "bg-gray-200",
        (disabled || readOnly) && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("border border-gray-300 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold text-sm">B</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
        >
          <span className="italic text-sm">I</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('strikeThrough')}
          title="Strikethrough"
        >
          <span className="text-sm line-through">S</span>
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          onClick={() => executeCommand('insertHTML', '<code></code>')}
          title="Inline Code"
        >
          <span className="text-sm font-mono">&lt;/&gt;</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('formatBlock', 'blockquote')}
          title="Quote"
        >
          <span className="text-sm">99</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('formatBlock', 'h2')}
          title="Heading"
        >
          <span className="text-sm font-bold">H</span>
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <div className="flex flex-col gap-0.5">
            <div className="w-3 h-0.5 bg-current"></div>
            <div className="w-3 h-0.5 bg-current"></div>
            <div className="w-3 h-0.5 bg-current"></div>
          </div>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
        >
          <div className="flex flex-col gap-0.5">
            <div className="text-xs">1.</div>
            <div className="text-xs">2.</div>
          </div>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('insertHTML', '<pre><code></code></pre>')}
          title="Code Block"
        >
          <span className="text-sm">{'{}'}</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('insertHorizontalRule')}
          title="Horizontal Rule"
        >
          <div className="w-4 h-0.5 bg-current"></div>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled && !readOnly}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "min-h-[120px] p-3 focus:outline-none",
          isFocused && "ring-2 ring-blue-500 ring-opacity-50",
          (disabled || readOnly) && "bg-gray-50 cursor-not-allowed"
        )}
        style={{
          whiteSpace: 'pre-wrap',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      {/* Placeholder */}
      {!value && (
        <div className="absolute top-12 left-3 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
