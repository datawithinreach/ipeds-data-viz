import type { ElementType } from 'react';

export type PropDoc = {
  name: string;
  type: string;
  description: string;
};

export type ComponentExample = {
  name: string;
  code: string;
  propDocs: PropDoc[];
};

export type ComponentMap = Record<string, ElementType>;
