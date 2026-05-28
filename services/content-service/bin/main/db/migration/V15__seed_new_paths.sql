-- =============================================================
-- V12: Add 4 New Learning Paths (Docker, Kubernetes, Git & GitHub, Next.js)
-- =============================================================

-- Insert the 4 new learning paths
INSERT INTO learning_paths (id, slug, title, description, level_min, level_max, icon, order_index, is_active)
VALUES
  (gen_random_uuid(), 'docker',     'Docker',          'Containers, Compose, registries and production deployments', 1, 4, 'container',  19, true),
  (gen_random_uuid(), 'kubernetes', 'Kubernetes',      'Orchestrate containers at scale with K8s',                   3, 5, 'server',     20, true),
  (gen_random_uuid(), 'git-github', 'Git & GitHub',    'Version control, collaboration and CI/CD workflows',         1, 4, 'git-branch', 21, true),
  (gen_random_uuid(), 'nextjs',     'Next.js',         'Full-stack React with SSR, SSG, App Router and deployment',  2, 5, 'triangle',   22, true);

-- -------------------------------------------------------------
-- Path: Docker (docker)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'docker';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'what-is-docker',          'What Is Docker',          1, 20, 1,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'containers-vs-vms',       'Containers Vs Vms',       1, 20, 2,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-installation',     'Docker Installation',     1, 20, 3,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-cli-basics',       'Docker Cli Basics',       1, 25, 4,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-images',           'Docker Images',           2, 35, 5,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dockerfile',              'Dockerfile',              2, 35, 6,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dockerfile-best-practices','Dockerfile Best Practices',2,35, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-containers',       'Docker Containers',       2, 35, 8,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-volumes',          'Docker Volumes',          2, 35, 9,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-networking',       'Docker Networking',       2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-compose',          'Docker Compose',          3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-compose-advanced', 'Docker Compose Advanced', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'multi-stage-builds',      'Multi Stage Builds',      3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-registries',       'Docker Registries',       3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-hub',              'Docker Hub',              3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-security',         'Docker Security',         4, 60, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-logging',          'Docker Logging',          4, 60, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-monitoring',       'Docker Monitoring',       4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-production',       'Docker Production',       4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-swarm',            'Docker Swarm',            4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'container-optimization',  'Container Optimization',  4, 60, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-ci-cd',            'Docker Ci Cd',            4, 60, 22, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Kubernetes (kubernetes)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'kubernetes';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'what-is-kubernetes',          'What Is Kubernetes',          3, 40, 1,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'k8s-architecture',            'K8s Architecture',            3, 50, 2,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'kubectl-basics',              'Kubectl Basics',              3, 40, 3,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pods',                        'Pods',                        3, 50, 4,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'deployments-k8s',             'Deployments',                 3, 50, 5,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'replicasets',                 'Replicasets',                 3, 50, 6,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'services-k8s',                'Services',                    3, 50, 7,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'namespaces',                  'Namespaces',                  3, 40, 8,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'configmaps',                  'Configmaps',                  4, 60, 9,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'secrets-k8s',                 'Secrets',                     4, 60, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'persistent-volumes',          'Persistent Volumes',          4, 60, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'ingress-k8s',                 'Ingress',                     4, 60, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'resource-management',         'Resource Management',         4, 60, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'health-checks-k8s',           'Health Checks',               4, 60, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'horizontal-pod-autoscaler',   'Horizontal Pod Autoscaler',   4, 60, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'rbac-k8s',                    'Rbac',                        4, 60, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'statefulsets',                'Statefulsets',                4, 60, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'daemonsets',                  'Daemonsets',                  4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'helm-charts',                 'Helm Charts',                 5, 75, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'k8s-networking-deep',         'K8s Networking Deep',         5, 75, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'service-mesh-k8s',            'Service Mesh',                5, 75, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'k8s-monitoring',              'K8s Monitoring',              5, 75, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'k8s-security',                'K8s Security',                5, 75, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'cluster-management',          'Cluster Management',          5, 75, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'custom-resource-definitions', 'Custom Resource Definitions', 5, 75, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'k8s-ci-cd',                   'K8s Ci Cd',                   5, 75, 26, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Git & GitHub (git-github)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'git-github';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'what-is-git',            'What Is Git',            1, 20, 1,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-installation',       'Git Installation',        1, 20, 2,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-init-and-clone',     'Git Init And Clone',      1, 25, 3,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-staging-and-commit', 'Git Staging And Commit',  1, 25, 4,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-status-and-log',     'Git Status And Log',      1, 25, 5,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-diff',               'Git Diff',                1, 25, 6,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-branching',          'Git Branching',           2, 35, 7,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-merging',            'Git Merging',             2, 35, 8,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-rebasing',           'Git Rebasing',            2, 35, 9,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-stash',              'Git Stash',               2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-remote',             'Git Remote',              2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-push-pull-fetch',    'Git Push Pull Fetch',     2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-tags',               'Git Tags',                2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'github-basics',          'Github Basics',           2, 35, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pull-requests',          'Pull Requests',           3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'code-review',            'Code Review',             3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'github-issues',          'Github Issues',           3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'github-actions',         'Github Actions',          3, 50, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'branch-protection',      'Branch Protection',       3, 50, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-workflows',          'Git Workflows',           3, 50, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-hooks',              'Git Hooks',               4, 60, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-submodules',         'Git Submodules',          4, 60, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-bisect',             'Git Bisect',              4, 60, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-reflog',             'Git Reflog',              4, 60, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'github-advanced',        'Github Advanced',         4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'monorepo-git',           'Monorepo Git',            4, 60, 26, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Next.js (nextjs)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'nextjs';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'nextjs-intro',             'Nextjs Intro',             2, 35, 1,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'app-router',               'App Router',               2, 35, 2,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pages-router',             'Pages Router',             2, 35, 3,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'routing-nextjs',           'Routing Nextjs',           2, 35, 4,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'layouts-and-templates',    'Layouts And Templates',    2, 35, 5,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'server-components-next',   'Server Components Next',   3, 50, 6,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'client-components',        'Client Components',        3, 50, 7,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'data-fetching-next',       'Data Fetching Next',       3, 50, 8,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'server-actions',           'Server Actions',           3, 50, 9,  FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'static-site-generation',   'Static Site Generation',   3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'server-side-rendering',    'Server Side Rendering',    3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'incremental-static-regen', 'Incremental Static Regen', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'api-routes-next',          'Api Routes Next',          3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'middleware-next',          'Middleware Next',           4, 60, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-auth',              'Nextjs Auth',              4, 60, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-image',             'Nextjs Image',             4, 60, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-fonts',             'Nextjs Fonts',             4, 60, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-metadata',          'Nextjs Metadata',          4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-caching',           'Nextjs Caching',           4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-database',          'Nextjs Database',          4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-testing',           'Nextjs Testing',           4, 60, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-performance',       'Nextjs Performance',       5, 75, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-deployment',        'Nextjs Deployment',        5, 75, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-streaming',         'Nextjs Streaming',         5, 75, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'parallel-routes',          'Parallel Routes',          5, 75, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-internationalization','Nextjs Internationalization',5,75, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-monorepo',          'Nextjs Monorepo',          5, 75, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-edge-runtime',      'Nextjs Edge Runtime',      5, 75, 28, FALSE, FALSE, TRUE);
  END IF;
END $$;
