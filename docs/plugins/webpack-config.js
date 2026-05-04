import path from 'path';

/**
 * Docusaurus plugin that adds a webpack alias so imports starting with `@/`
 * resolve to the monorepo root. This lets docs pages import chart
 * components and shared styles from the main app without duplicating them.
 */
module.exports = function webpackConfigPlugin() {
  return {
    name: 'custom-webpack-config',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, '../..'),
          },
        },
      };
    },
  };
};
