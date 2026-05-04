import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  contributorSidebar: [
    {
      type: 'doc',
      id: 'how-to-contribute',
      label: 'How to Contribute',
    },
    {
      type: 'doc',
      id: 'finding-sources',
      label: 'Finding Sources in IPEDS',
    },
    {
      type: 'doc',
      id: 'templates',
      label: 'Template Gallery',
    },
    {
      type: 'doc',
      id: 'architecture',
      label: 'Architecture',
    },
  ],
};

export default sidebars;
