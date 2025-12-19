// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Fitness App Docs',
  tagline: 'Documentación completa del proyecto Fitness (Backend, Frontend y Base de Datos)',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'fitness-app',
  projectName: 'fitness-aprendizaje',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    localeConfigs: {
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: undefined,
          routeBasePath: '/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Fitness App',
        logo: {
          alt: 'Fitness App Logo',
          src: 'img/logo.svg',
        },
        items: [
          { 
            type: 'doc', 
            docId: 'intro', 
            position: 'left', 
            label: 'Guía rápida',
          },
          { 
            type: 'doc', 
            docId: 'backend/overview', 
            position: 'left', 
            label: 'Backend' 
          },
          { 
            type: 'doc', 
            docId: 'frontend/overview', 
            position: 'left', 
            label: 'Frontend' 
          },
          { 
            type: 'doc', 
            docId: 'database/schema', 
            position: 'left', 
            label: 'Base de datos' 
          },
          { 
            type: 'doc', 
            docId: 'api/overview', 
            position: 'left', 
            label: 'API' 
          },
          { 
            type: 'doc', 
            docId: 'devops/docker-and-render', 
            position: 'left', 
            label: 'DevOps' 
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Fitness App.`,
      },
    }),
};

module.exports = config;


