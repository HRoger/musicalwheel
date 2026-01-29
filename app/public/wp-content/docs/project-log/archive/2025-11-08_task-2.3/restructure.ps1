# Phase 2: Create Voxel Directory Structure
# Based on MERGE_STRATEGY.md

$basePath = "C:\Users\Local Sites\musicalwheel\app\public\wp-content\themes\musicalwheel-fse"

# Array of all directories to create
$directories = @(
    # app/ root structure
    "app\config",
    "app\controllers\approval-activity",
    "app\controllers\create-post",
    "app\controllers\frontend",
    "app\controllers\member-controller",
    "app\controllers\membership",
    "app\controllers\notifications",
    "app\controllers\orders",
    "app\controllers\post-types",
    "app\controllers\products",
    "app\controllers\timeline",
    "app\dynamic-data\data-handlers",
    "app\dynamic-data\directives",
    "app\dynamic-data\loop-types",
    "app\dynamic-data\modifiers",
    "app\dynamic-data\visibility-rules",
    "app\events\assets",
    "app\events\data",
    "app\events\dynamic-tags",
    "app\events\elementor",
    "app\events\membership",
    "app\events\nav-menus",
    "app\events\templates",
    "app\events\timeline",
    
    # app/modules - 11 addons
    "app\modules\custom-code",
    "app\modules\membership",
    "app\modules\messages",
    "app\modules\notifications",
    "app\modules\orders",
    "app\modules\peepso",
    "app\modules\post-relations",
    "app\modules\sharing-buttons",
    "app\modules\stats",
    "app\modules\stripe-utils",
    "app\modules\timeline",
    
    # app/post-types
    "app\post-types\fields",
    "app\post-types\fields\traits",
    "app\post-types\form",
    "app\post-types\nav-menus",
    "app\post-types\templates",
    "app\post-types\traits",
    
    # app/product-types
    "app\product-types\cart",
    "app\product-types\cart-items",
    "app\product-types\data-inputs",
    "app\product-types\order-items",
    "app\product-types\order-items\traits",
    "app\product-types\orders",
    "app\product-types\orders\traits",
    "app\product-types\payment-methods",
    "app\product-types\payment-services",
    "app\product-types\product-addons",
    "app\product-types\product-attributes",
    "app\product-types\product-fields",
    "app\product-types\product-form",
    "app\product-types\product-form\fields",
    "app\product-types\promotions",
    "app\product-types\shipping",
    "app\product-types\shipping\rates",
    "app\product-types\shipping\vendor-rates",
    "app\product-types\variations",
    
    # app/timeline
    "app\timeline\backend",
    "app\timeline\fields",
    "app\timeline\reply",
    "app\timeline\status",
    
    # app/users
    "app\users\registration-fields",
    
    # app/utils
    "app\utils\async-requests",
    "app\utils\config-schema",
    "app\utils\form-models",
    "app\utils\link-previewer",
    "app\utils\object-fields",
    "app\utils\text-formatter",
    "app\utils\vendor",
    
    # app/widgets
    "app\widgets\option-groups",
    
    # assets/ structure
    "assets\dist",
    "assets\icons\line-awesome",
    "assets\images\post-types",
    "assets\images\svgs",
    "assets\vendor\emoji-list",
    "assets\vendor\nouislider",
    "assets\vendor\pikaday",
    "assets\vendor\sortable",
    "assets\vendor\vue",
    "assets\vendor\vue-draggable",
    
    # templates/ structure (Voxel PHP templates)
    "templates\backend\dynamic-data\mode-edit-content",
    "templates\backend\dynamic-data\mode-edit-loop",
    "templates\backend\dynamic-data\mode-edit-visibility",
    "templates\backend\general-settings",
    "templates\backend\library",
    "templates\backend\membership",
    "templates\backend\nav-menus",
    "templates\backend\onboarding",
    "templates\backend\orders",
    "templates\backend\post-types\components",
    "templates\backend\product-types\modules",
    "templates\backend\product-types\partials",
    "templates\backend\product-types\product-fields",
    "templates\backend\product-types\settings",
    "templates\backend\roles\components",
    "templates\backend\taxonomies",
    "templates\backend\templates",
    "templates\backend\terms",
    "templates\backend\timeline\settings",
    "templates\components",
    "templates\defaults",
    "templates\emails",
    "templates\frontend",
    "templates\widgets\advanced-list",
    "templates\widgets\cart-summary",
    "templates\widgets\create-post\product-field\addons",
    "templates\widgets\create-post\product-field\booking",
    "templates\widgets\create-post\product-field\custom-prices",
    "templates\widgets\create-post\product-field\variations",
    "templates\widgets\login\recover",
    "templates\widgets\login\register",
    "templates\widgets\login\security",
    "templates\widgets\orders",
    "templates\widgets\post-feed",
    "templates\widgets\product-form\form-addons",
    "templates\widgets\product-form\form-data-inputs",
    "templates\widgets\search-form\location-filter",
    "templates\widgets\search-form\ssr",
    "templates\widgets\timeline\comment",
    "templates\widgets\timeline\comment-composer",
    "templates\widgets\timeline\comment-feed",
    "templates\widgets\timeline\partials",
    "templates\widgets\timeline\status",
    "templates\widgets\timeline\status-composer",
    "templates\widgets\timeline\status-feed",
    "templates\widgets\user-bar",
    
    # languages/
    "languages",
    
    # Modern additions
    "cli",
    "tests\unit",
    "tests\integration",
    "tests\e2e"
)

Write-Host "Creating $($directories.Count) directories..." -ForegroundColor Green

foreach ($dir in $directories) {
    $fullPath = Join-Path $basePath $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
        Write-Host "✓ $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Phase 2 complete: $($directories.Count) directories created" -ForegroundColor Green

