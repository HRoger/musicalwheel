<?php

namespace EssentialBlocks\Pro\Utils;

use EssentialBlocks\Traits\HasSingletone;

class ConditionalDisplay
{
    use HasSingletone;

    public function __construct()
    {
        add_filter("eb_conditional_display_results", [$this, "eb_conditional_display_results"]);
    }

    /**
     * Get current browser
     *
     * @return string
     */
    public function get_current_browser()
    {
        global $is_lynx, $is_gecko, $is_winIE, $is_macIE, $is_opera, $is_NS4, $is_safari, $is_chrome, $is_iphone, $is_edge;

        $browser = 'others';

        switch (true) {
            case $is_chrome:
                $browser = 'chrome';
                break;
            case $is_gecko:
                $browser = 'firefox';
                break;
            case $is_safari:
                $browser = 'safari';
                break;
            case $is_iphone:
                $browser = 'i_safari';
                break;
            case $is_opera:
                $browser = 'opera';
                break;
            case $is_edge:
                $browser = 'edge';
                break;
            case $is_winIE:
                $browser = 'ie';
                break;
            case $is_macIE:
                $browser = 'mac_ie';
                break;
            case $is_NS4:
                $browser = 'netscape4';
                break;
            case $is_lynx:
                $browser = 'lynx';
                break;
        }

        return $browser;
    }


    public function eb_conditional_display_results($attributes)
    {
        if (!isset($attributes['ebConditionalDisplay'])) {
            return;
        }

        $conditionalDisplay = $attributes['ebConditionalDisplay'];
        $conditions = $conditionalDisplay['conditions'] ?? [];
        $enable = $conditionalDisplay['enable'] ?? null;
        $visibility = $conditionalDisplay['visibility'] ?? 'show';

        // If not enabled, return
        if (!$enable || empty($conditions)) {
            return;
        }

        switch ($visibility) {
            case 'show':
                $should_render = $this->check_logics($conditionalDisplay) ? true : false;
                break;
            case 'hide':
                $should_render = $this->check_logics($conditionalDisplay) ? false : true;
                break;
            case 'forcefully_hide':
                $should_render = false;
        }

        return $should_render;
    }

    public function check_logics($settings)
    {
        $return                = false;
        $conditions = $settings['conditions'] ?? [];
        $needed_any_logic_true = $settings['trigger'] === 'any';
        $needed_all_logic_true = $settings['trigger'] === 'all';
        foreach ($conditions as $condition) {
            if (!isset($condition['type'])) {
                continue;
            }

            switch ($condition['type']) {
                case 'login_status':

                    $return = $condition['login_status'] === 'logged_in' ? is_user_logged_in() : ! is_user_logged_in();

                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }
                    break;
                case 'role':

                    if (is_user_logged_in() && !empty($condition['role'])) {
                        $values = array_map(function ($item) {
                            return $item['value'];
                        }, json_decode($condition['role'], true));
                        $user = wp_get_current_user();
                        $result = array_intersect($values, $user->roles);
                        $return = count($result) > 0 ? true : false;
                    }

                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }
                    break;
                case 'post_type':

                    $ID                 = get_the_ID();
                    $post_type          = get_post_type($ID);
                    $post_type_data = json_decode($condition['post_type'] ?? '[]', true);
                    $values = array_map(function ($item) {
                        return $item['value'];
                    }, $post_type_data);
                    $return = in_array($post_type, $values);

                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }
                    break;
                case 'browser':
                    $browser = $this->get_current_browser();
                    $browserData = json_decode($condition['browser'] ?? '[]', true);
                    $values = array_map(function ($item) {
                        return $item['value'];
                    }, $browserData);
                    $return = in_array($browser, $values);

                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }
                    break;
                case 'date_time':
                    $current_time = current_time('U');
                    
                    $from         = ($condition['date_condition'] === 'equal' || $condition['date_condition'] === 'not_equal') ? strtotime("{$condition['single_date']} 00:00:00") : strtotime($condition['from_date']);
                    $to           = ($condition['date_condition'] === 'equal' || $condition['date_condition'] === 'not_equal') ? strtotime("{$condition['single_date']} 23:59:59") : strtotime($condition['to_date']);
                    $return       = $condition['date_condition'] === 'equal' || $condition['date_condition'] === 'between' ? $from <= $current_time && $current_time <= $to : $from >= $current_time || $current_time >= $to;

                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }
                    break;
                case 'query_string':

                    $return = isset($condition['query_string_key']) && $condition['query_string_key'] && isset($_GET[$condition['query_string_key']]) && sanitize_text_field($_GET[$condition['query_string_key']]) === $condition['query_string_value'];


                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }

                    break;
                case 'url_contains':

                    $url = (isset($condition['url_type']) && $condition['url_type'] === 'current') ? $_SERVER['REQUEST_URI'] : $_SERVER['HTTP_REFERER'];
                    $string = trim($condition['url_contains'] ?? "");
                    if ($string) {
                        $return = str_contains($url, $string);
                        $return = 'in' === $condition['url_logic_operator'] ? $return : ! $return;
                    }

                    if ($needed_any_logic_true && $return) {
                        break (2);
                    }

                    if ($needed_all_logic_true && ! $return) {
                        break (2);
                    }

                    break;
                case 'archive':
                    if ('search' === $condition['archive_type']) {
                        $return = is_search();
                    } else if ('post' === $condition['archive_type']) {

                        if ('post' === $condition['archive_post_type']) {
                            $return = is_home();
                        } else if (function_exists('WC') && 'product' === $condition['archive_post_type']) {
                            $return = is_shop();
                        } else if ('' !== $condition['archive_post_type']) {
                            $return = is_post_type_archive($condition['archive_post_type']);
                        }
                    } else if ('taxonomy' === $condition['archive_type']) {
                        if('all' === $condition['archive_taxonomy']){
                            $return =  true;
                        } else if ('category' === $condition['archive_taxonomy']) {
                            $return = is_category();
                        } else if ('post_tag' === $condition['archive_taxonomy']) {
                            $return = is_tag();
                        } else if ('post_format' === $condition['archive_taxonomy']) {
                            $return = has_post_format();
                        } else if ('' !== $condition['archive_taxonomy']) {
                            $return = is_tax($condition['archive_taxonomy']);
                        }
                    } else if ('author' === $condition['archive_type'] && is_author()) {
                        if ("user" === $condition['archive_author_type']) {
                            if (isset($condition['archive_author_users']) && empty($condition['archive_author_users'])) {
                                $return = is_author();
                            } else if (isset($condition['archive_author_users']) && ! empty($condition['archive_author_users'])) {
                                $author_id = get_queried_object_id();
                                $return = in_array($author_id, array_column(json_decode($condition['archive_author_users'] ?? '[]', true),"value"));
                            }
                        } else if (isset($condition['archive_author_type']) && "user_role" === $condition['archive_author_type']) {
                            if (empty($condition['archive_user_role'])) {
                                $return = is_author();
                            } else if (isset($condition['archive_author_type']) && ! empty($condition['archive_user_role'])) {
                                $author_id = get_queried_object_id();
                                $author    = get_user_by('ID', $author_id);
                                $has_role  = array_intersect(array_column(json_decode($condition['archive_user_role'] ?? '[]', true),"value"), $author->roles);
                                $return    = count($has_role) > 0;
                            }
                        }
                    } else if ( 'date' === $condition['archive_type'] ){
						if( "" === $condition['archive_date_from'] || "" === $condition['archive_date_to'] ){
							$return = is_date();

						} else if ( is_year() ) {
							$start_year   = date( 'Y', strtotime( $condition['archive_date_from'] ) );
							$end_year     = date( 'Y', strtotime( $condition['archive_date_to'] ) );
							$archive_year = get_query_var( 'year' );
							$return       = $start_year <= $archive_year && $archive_year <= $end_year;

						} elseif ( is_month() ) {
							$start         = strtotime( $condition['archive_date_from'] );
							$end           = strtotime( $condition['archive_date_to'] );
							$archive_year  = get_query_var( 'year' );
							$archive_month = get_query_var( 'monthnum' );
							$time_str      = strtotime("$archive_year-$archive_month-01");
							$month_first   = strtotime( date('Y-m-01', $time_str ) );
							$month_last    = strtotime( date('Y-m-t', $time_str ) );
							$return        = $start <= $month_first && $month_last <= $end;

						} elseif ( is_day() ) {
							$start         = strtotime( $condition['archive_date_from'] );
							$end           = strtotime( $condition['archive_date_to'] );
							$archive_year  = get_query_var( 'year' );
							$archive_month = get_query_var( 'monthnum' );
							$archive_day   = get_query_var( 'day' );
							$archive_date  = strtotime("$archive_year-$archive_month-$archive_day");
							$return        = $start <= $archive_date && $archive_date <= $end;
							
						}
					}

                    if (($needed_any_logic_true && $return) || ($needed_all_logic_true && ! $return)) {
                        break (2);
                    }
                    break;
                default:
                    break;
            }
        }

        return $return;
    }
}
