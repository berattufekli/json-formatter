import type { Metadata } from 'next';
import { Workbench } from '@/components/workbench/workbench';
import { getTool } from '@/lib/tools';

const tool = getTool('yaml')!;

export const metadata: Metadata = {
  title: `${tool.label} Formatter`,
  description: `${tool.tagline}. Runs in your browser; nothing is uploaded.`,
};

export default function Page() {
  return <Workbench toolId="yaml" />;
}
