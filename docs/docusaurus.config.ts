import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'IPEDS Data Viz Docs',
  tagline: 'Contributor guide and component examples',

  url: 'https://datawithinreach.github.io',
  baseUrl: '/ipeds-data-viz/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  plugins: [
    'docusaurus-plugin-sass',
    require.resolve('./plugins/webpack-config'),
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/theme/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'IPEDS Data Viz',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'contributorSidebar',
          position: 'left',
          label: 'Contributor Guide',
        },
        {
          to: '/components',
          label: 'Components',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Data Within Reach.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
