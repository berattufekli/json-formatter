'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Wand2,
  Minimize2,
  CheckCircle2,
  Copy,
  Trash2,
  Download,
  Upload,
  AlignLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onCopy: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: () => void;
  onSortKeys: () => void;
  sortKeys: boolean;
  hasContent: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

function ToolbarButton({ icon, label, shortcut, onClick, disabled, active }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant={active ? 'default' : 'ghost'}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="text-muted-foreground">{shortcut}</kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function Toolbar({
  onFormat,
  onMinify,
  onValidate,
  onCopy,
  onClear,
  onExport,
  onImport,
  onSortKeys,
  sortKeys,
  hasContent,
  className,
}: ToolbarProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b p-2', className)}>
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Wand2 size={18} />}
          label="Format JSON"
          shortcut="Ctrl+Shift+F"
          onClick={onFormat}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<Minimize2 size={18} />}
          label="Minify JSON"
          shortcut="Ctrl+Shift+M"
          onClick={onMinify}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<CheckCircle2 size={18} />}
          label="Validate JSON"
          shortcut="Ctrl+Shift+V"
          onClick={onValidate}
          disabled={!hasContent}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<AlignLeft size={18} />}
          label="Sort Keys"
          onClick={onSortKeys}
          active={sortKeys}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Copy size={18} />}
          label="Copy"
          shortcut="Ctrl+C"
          onClick={onCopy}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<Download size={18} />}
          label="Export"
          onClick={onExport}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<Upload size={18} />}
          label="Import"
          onClick={onImport}
        />
        <ToolbarButton
          icon={<Trash2 size={18} />}
          label="Clear"
          onClick={onClear}
          disabled={!hasContent}
        />
      </div>
    </div>
  );
}
