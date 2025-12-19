/**
 * Sidebar principal de la documentación.
 * Organizamos por áreas: Introducción, Backend, Frontend, Base de datos, API y DevOps.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Introducción',
      collapsed: false,
      items: [
        'intro',
        'getting-started/project-overview',
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      collapsed: false,
      items: [
        'backend/overview',
        'backend/routes-and-controllers',
        'backend/middleware',
        'backend/config-and-env',
      ],
    },
    {
      type: 'category',
      label: 'Frontend',
      collapsed: false,
      items: [
        'frontend/overview',
        'frontend/routing-and-pages',
        'frontend/components',
        'frontend/state-and-data-fetching',
      ],
    },
    {
      type: 'category',
      label: 'Base de datos',
      collapsed: false,
      items: [
        'database/schema',
        'database/migrations-and-seeding',
      ],
    },
    {
      type: 'category',
      label: 'API',
      collapsed: false,
      items: [
        'api/overview',
        'api/auth',
        'api/exercises',
        'api/workouts',
        'api/nutrition',
        'api/admin-and-coach',
      ],
    },
    {
      type: 'category',
      label: 'DevOps y despliegue',
      collapsed: false,
      items: [
        'devops/docker-and-render',
        'devops/local-development',
      ],
    },
  ],
};

module.exports = sidebars;


