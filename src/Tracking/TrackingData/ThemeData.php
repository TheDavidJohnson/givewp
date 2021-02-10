<?php
namespace Give\Tracking\TrackingData;

use Give\Tracking\Contracts\TrackData;
use WP_Theme;

/**
 * Class ThemeData
 *
 * Represents the theme data.
 *
 * @since 2.10.0
 * @package Give\Tracking\TrackingData
 */
class ThemeData implements TrackData {

	/**
	 * Returns the collection data.
	 *
	 * @since 2.10.0
	 *
	 * @return array The collection data.
	 */
	public function get() {
		$theme = wp_get_theme();
		$data  = $this->formatData( $theme );

		if ( $this->isChildTheme( $theme ) ) {
			$parentTheme         = wp_get_theme( $theme->offsetGet( 'Template' ) );
			$data['parentTheme'] = $this->formatData( $parentTheme, true );
		}

		return $data;
	}

	/**
	 * Format theme data.
	 *
	 * @since 2.10.0
	 *
	 * @param  WP_Theme  $theme
	 * @param  bool  $parentTheme
	 *
	 * @return array
	 */
	private function formatData( $theme, $parentTheme = false ) {
		$slugKey    = 'theme_slug';
		$versionKey = 'theme_version';

		if ( $parentTheme ) {
			$slugKey    = 'parent_theme_slug';
			$versionKey = 'parent_theme_version';
		}
		return [
			$slugKey    => $theme->offsetGet( 'Stylesheet' ),
			$versionKey => $theme->get( 'Version' ),
		];
	}

	/**
	 * Return whether or not active theme is child them or not.
	 * Note: is_child_theme WordPress  function does not return correct return immediately after switching theme.
	 *
	 * @since 2.10.0
	 *
	 * @param $theme
	 *
	 * @return bool
	 */
	private function isChildTheme( $theme ) {
		$themeSlug     = $theme->offsetGet( 'Stylesheet' );
		$themeTemplate = $theme->offsetGet( 'Template' );

		return $themeSlug !== $themeTemplate;
	}
}

