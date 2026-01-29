## GIT WORKFLOW - TWO REPOSITORIES

### Repository 1: WordPress FSE Theme
**Path**: `wp-content/themes/musicalwheel-fse/`
**Repository**: `github.com/yourorg/musicalwheel-fse-theme`

### Repository 2: Next.js Frontend
**Path**: `C:\Users\Local Sites\musicalwheel-frontend\`
**Repository**: `github.com/yourorg/musicalwheel-frontend`

**.env.example** (commit this):
```env
WORDPRESS_API_URL=http://musicalwheel.local/graphql
WORDPRESS_REST_URL=http://musicalwheel.local/wp-json
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```