---
url: "https://docs.getvoxel.io/articles/extending-dynamic-data-custom-properties-and-methods/"
title: "Extending dynamic data: Custom properties and methods - docs.getvoxel.io"
processed_date: 2025-10-31T16:56:07.820Z
images_embedded: 0
links_converted: 0
original_size: 5755
processed_size: 5755
processed_date: 2025-10-31T18:03:26.308Z
images_embedded: 0
links_converted: 5
original_size: 5874
processed_size: 5847
---
[DOCS](docs.getvoxel.io_.md)

Search all articles

CTRL+K

## Extending dynamic data: Custom properties and methods

Custom properties can be added through the following filter:

```
apply_filters(
  'voxel/dynamic-data/groups/{group_key}/properties',
  $properties,
  $group
);
```

where **{group\_key}** can be **post**, **user**, **term**, **site**, etc.

## Example 1: Adding a custom property to the User group

Goal: Add a **Website** property which pulls the user website from the native Website field:

```
add_filter( 'voxel/dynamic-data/groups/user/properties', function( $properties, $group ) {
	$properties['website'] = \Voxel\Dynamic_Data\Tag::String('Website')
		->render( function() use ( $group ) {
			$user_id = $group->user->get_id();
			$website = get_the_author_meta( 'url', $user_id );

			return $website;
		} );

	return $properties;
}, 10, 2 );
```

The **Website** property is now available for selection for **User** groups through the dynamic data modal, or manually by typing **@user(website)** or **@author(website)**

## Example 2: Adding a custom property to a post type group

Goal: Add a **Post status** property to posts of a **Places** post type, which pulls the post status key and label:

```
add_filter( 'voxel/dynamic-data/groups/post/properties', function( $properties, $group ) {
	if ( $group->post_type->get_key() === 'places' ) {
		$properties['status'] = \Voxel\Dynamic_Data\Tag::Object('Post status')
			->properties( function() use ( $group ) {
				return [\
					'key' => \Voxel\Dynamic_Data\Tag::String('Key')\
						->render( function() use ( $group ) {\
							return $group->post->get_status();\
						} ),\
					'label' => \Voxel\Dynamic_Data\Tag::String('Label')\
						->render( function() use ( $group ) {\
							global $wp_post_statuses;\
							return $wp_post_statuses[ $group->post->get_status() ]->label ?? '';\
						} ),\
				];
			} );
	}

	return $properties;
}, 10, 2 );
```

We can now access the **Post status** property for all posts in the **Places** post type. This property will be shown in the dynamic data modal, and can also be typed manually as **@post(status.key)** for the status key (e.g. **publish**), and **@post(status.label)** for the status label (e.g. **Published**).

## Example 3: Adding a custom method to the Site group

Goal: Add a **Get site option** method which lets us pull any information from the **wp\_options** table in the following format: **@site().get\_option(option\_key)**

Step 1: Create the method PHP class in a file located in /my-plugin/custom-methods/ **get-option.php**:

```
<?php

namespace My_Plugin\Custom_Methods;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Get_Option extends \Voxel\Dynamic_Data\Modifiers\Group_Methods\Base_Group_Method {

	public function get_label(): string {
		return 'Get site option';
	}

	public function get_key(): string {
		return 'get_option';
	}

	protected function define_args(): void {
		$this->define_arg( [\
			'type' => 'text',\
			'label' => 'Option key',\
		] );
	}

	public function run( $group ) {
		$option_key = $this->get_arg(0);
		if ( $option_key === '' ) {
			return null;
		}

		return get_option( $option_key, null );
	}
}

```

Step 2: Register the method in **functions.php** or a custom file

```
add_filter( 'voxel/dynamic-data/groups/site/methods', function( $methods ) {
  // ensure the Get_Option class can be autoloaded, or load manually using:
  // require_once trailingslashit( plugin_dir_path( __FILE__ ) ) . 'custom-methods/get-option.php';

	$methods['get_option'] = \My_Plugin\Custom_Methods\Get_Option::class;
	return $methods;
} );
```

The method is now listed in the dynamic data modal under the **Site** group. It can also be manually typed using **@site().get\_option(option\_key).** For example, to retrieve the site title as configured in WP Admin > Settings > General > Site Title, you can use **@site().get\_site\_option(blogname)**

## Example 4: Adding a custom method to the Site group (single-file)

Goal: Add a **Postmeta** method which lets us pull metadata from a post using the post ID and meta key as follows: @site().postmeta(124,event-date)

```
add_action( 'after_setup_theme', function() {
	class Get_Post_Meta_Method extends \Voxel\Dynamic_Data\Modifiers\Group_Methods\Base_Group_Method {
		public function get_label(): string {
			return 'Postmeta';
		}

		public function get_key(): string {
			return 'postmeta';
		}

		protected function define_args(): void {
			$this->define_arg( [\
				'type' => 'text',\
				'label' => 'Post ID',\
			] );

			$this->define_arg( [\
				'type' => 'text',\
				'label' => 'Meta key',\
			] );
		}

		public function run( $group ) {
			if ( ! is_numeric( $this->get_arg(0) ) || empty( $this->get_arg(1) ) ) {
				return '';
			}

			return get_post_meta( $this->get_arg(0), $this->get_arg(1), true );
		}
	}
} );

add_filter( 'voxel/dynamic-data/groups/site/methods', function( $methods ) {
	$methods['postmeta'] = \Get_Post_Meta_Method::class;
	return $methods;
} );
```

The method is now listed in the dynamic data modal under the **Site** group.

### Continue reading

[**Voxel Email template**\\
\\
- Developers](docs.getvoxel.io_articles_email-template_.md)

[**Voxel Child theme (Optional)**\\
\\
- Installation \\
\\
- Developers](docs.getvoxel.io_articles_voxel-child-theme_.md)

No similar articles

[Reset](docs.getvoxel.io_articles_extending-dynamic-data-custom-properties-and-methods_.md)

[Load more](docs.getvoxel.io_articles_extending-dynamic-data-custom-properties-and-methods_.md)