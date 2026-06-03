'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
}

function ToolbarButton({ icon, label, onClick, disabled, active, variant = 'ghost' }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant={variant}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-8 px-3 gap-2 text-xs font-medium transition-all",
            active 
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50" 
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
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
    <div className={cn('flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50', className)}>
      {/* Format Actions */}
      <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-1">
        <ToolbarButton
          icon={<Wand2 size={15} />}
          label="Format"
          onClick={onFormat}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<Minimize2 size={15} />}
          label="Minify"
          onClick={onMinify}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<CheckCircle2 size={15} />}
          label="Validate"
          onClick={onValidate}
          disabled={!hasContent}
        />
      </div>

      {/* Sort Keys */}
      <ToolbarButton
        icon={<AlignLeft size={15} />}
        label={sortKeys ? "Sorted" : "Sort Keys"}
        onClick={onSortKeys}
        active={sortKeys}
      />

      {/* Divider */}
      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Clipboard Actions */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Copy size={15} />}
          label="Copy"
          onClick={onCopy}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<Download size={15} />}
          label="Export"
          onClick={onExport}
          disabled={!hasContent}
        />
        <ToolbarButton
          icon={<Upload size={15} />}
          label="Import"
          onClick={onImport}
        />
        <ToolbarButton
          icon={<Trash2 size={15} />}
          label="Clear"
          onClick={onClear}
          disabled={!hasContent}
        />
      </div>
    </div>
  );
}
