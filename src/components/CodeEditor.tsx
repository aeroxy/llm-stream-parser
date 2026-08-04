import { useMemo } from 'react';
import CodeMirror, { EditorView, type Extension, type ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { githubLight } from '@uiw/codemirror-theme-github';
import { cn } from '@/lib/cn';

/**
 * Shared CodeMirror 6 editor (github-light theme): syntax highlighting,
 * bracket matching, code folding, line numbers. Used read-only for the
 * normalized-JSON output view.
 */
export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  className,
  height = '100%',
  ...rest
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  height?: string;
} & Omit<ReactCodeMirrorProps, 'value' | 'onChange' | 'height' | 'extensions'>) {
  const extensions = useMemo<Extension[]>(() => [json(), EditorView.lineWrapping], []);
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      editable={!readOnly}
      extensions={extensions}
      theme={githubLight}
      height={height}
      basicSetup={{ foldGutter: true, autocompletion: !readOnly }}
      // `height: 100%` on .cm-editor only resolves if this wrapper has a
      // definite height — without it the editor grows to content and never scrolls.
      className={cn('min-w-0 text-[12px]', height === '100%' && 'h-full', className)}
      {...rest}
    />
  );
}
