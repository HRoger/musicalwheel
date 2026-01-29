<?php

namespace EssentialBlocks\Pro\Utils;

use EssentialBlocks\Utils\Helper as FreeHelper;
use EssentialBlocks\Pro\Utils\CountryHelper;

class Helper extends FreeHelper
{
    protected static function get_views_path($name)
    {
        $_free_views_path = parent::get_views_path($name);

        if ($_free_views_path === false) {
            $_free_views_path =
                ESSENTIAL_BLOCKS_PRO_DIR_PATH . "views/" . $name . ".php";
        }

        if (file_exists($_free_views_path)) {
            return $_free_views_path;
        }

        return false;
    }

    /**
     * Get views for front-end display
     *
     * @param string $name  it will be file name only from the view's folder.
     * @param array $data
     * @return array
     */
    // public static function views( $name, $data = [] ) {
    //     extract( $data );
    //     $helper = self::class;

    //     $file = ESSENTIAL_BLOCKS_PRO_DIR_PATH . 'views/' . $name . '.php';

    //     if ( is_readable( $file ) ) {
    //         include $file;
    //     }
    // }

    public static function modify_array_key($array, $name)
    {
        $newArray = [];

        // Loop through each key-value pair in the original array
        foreach ($array as $key => $value) {
            // Add "site/" to the beginning of each key
            $newKey = $name . "/" . $key;

            // Add the key-value pair with the modified key to the new array
            $newArray[$newKey] = $value;
        }
        return $newArray;
    }

    /**
     * Function for get recaptcha settings
     * @param string $property [optional]
     */
    public static function get_recaptcha_settings($property = null)
    {
        $eb_settings = get_option("eb_settings");
        if (isset($eb_settings["reCaptcha"])) {
            $recaptchSetting = json_decode(
                wp_unslash($eb_settings["reCaptcha"])
            );
            if (
                is_object($recaptchSetting) &&
                isset($recaptchSetting->$property)
            ) {
                return $recaptchSetting->$property;
            }
            return $recaptchSetting;
        }
    }

    /**
     * Function for get recaptcha settings
     * @param string $property [optional]
     */
    public static function get_mailchimp_api()
    {
        $eb_settings = get_option("eb_settings");
        if (isset($eb_settings["mailchimp"])) {
            return $eb_settings["mailchimp"];
        }
    }

    /**
     * Get form columns
     */
    public static function get_form_title($form_id)
    {
        global $wpdb;
        $table_name = ESSENTIAL_BLOCKS_FORM_SETTINGS_TABLE;

        $query = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT title FROM $table_name WHERE block_id = %s",
                $form_id
            )
        );

        $title = isset($query->title) ? $query->title : "Untitled";

        return $title;
    }

    /**
     * Get form columns
     */
    public static function get_form_columns($form_id)
    {
        global $wpdb;
        $table_name = ESSENTIAL_BLOCKS_FORM_SETTINGS_TABLE;

        $query = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT fields FROM $table_name WHERE block_id = %s",
                $form_id
            )
        );

        $form_fields = $query->fields;

        $columns = [];
        if (is_serialized($form_fields)) {
            // $columns['id'] = 'Id';
            $fields = unserialize($form_fields);
            if (count($fields) > 0) {
                foreach ($fields as $index => $field) {
                    $columns[$index] = isset($field->label)
                        ? $field->label
                        : $index;
                }
            }
            $columns["email_status"] = "Email Status";
            $columns["submitted_at"] = "Submitted Time";
        }

        return $columns;
    }

    /**
     * Get the form response table data with enhanced country field display
     *
     * This method retrieves form response data and enhances country fields
     * to display flag icons and full country names instead of just codes.
     *
     * @param string $form_id The form ID to retrieve responses for
     * @param string $search Optional search term to filter responses
     * @return array Enhanced form response data with country flags and names
     */
    public static function form_response_table_data($form_id, $search = "")
    {
        $data = [];

        global $wpdb;
        $table_name = ESSENTIAL_BLOCKS_FORM_ENTRIES_TABLE;

        $responses = [];
        if (!empty($search)) {
            $query = $wpdb->prepare(
                "SELECT * FROM $table_name WHERE block_id=%s AND response like %s ORDER BY created_at DESC",
                $form_id,
                "%" . $wpdb->esc_like($search) . "%"
            );

            $responses = $wpdb->get_results($query);
        } else {
            $responses = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table_name WHERE block_id = %s ORDER BY created_at DESC",
                    $form_id
                )
            );
        }

        // Get form field settings to identify field types
        $form_settings = self::get_form_field_settings($form_id);

        if ($responses) {
            foreach ($responses as $index => $item) {
                if (isset($item->response) && is_serialized($item->response)) {
                    $response_data = unserialize($item->response);

                    // Enhance country field display with flags and names
                    $response_data = self::enhance_country_field_display($response_data, $form_settings);

                    // $response_data['id']           = isset( $item->id ) ? $item->id : '';
                    $response_data["email_status"] = isset($item->email_status)
                        ? ($item->email_status === "1"
                            ? "success"
                            : "failed")
                        : "";
                    $response_data["submitted_at"] = isset($item->created_at)
                        ? $item->created_at
                        : "";
                    $data[] = $response_data;
                }
            }
        }
        return $data;
    }

    /**
     * Get form field settings to identify field types
     *
     * @param string $form_id Form ID
     * @return array Form field settings
     */
    private static function get_form_field_settings($form_id)
    {
        global $wpdb;
        $table_name = ESSENTIAL_BLOCKS_FORM_SETTINGS_TABLE;

        $query = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT fields FROM $table_name WHERE block_id = %s",
                $form_id
            )
        );

        if ($query && isset($query->fields) && is_serialized($query->fields)) {
            return unserialize($query->fields);
        }

        return [];
    }

    /**
     * Enhance country field display with flags and country names
     *
     * @param array $response_data Form response data
     * @param array $form_settings Form field settings
     * @return array Enhanced response data
     */
    private static function enhance_country_field_display($response_data, $form_settings)
    {
        if (!is_array($response_data) || !is_array($form_settings)) {
            return $response_data;
        }

        foreach ($form_settings as $field_name => $field_config) {
            if (!is_object($field_config)) {
                continue;
            }

            $field_type = isset($field_config->type) ? $field_config->type : '';

            // Handle country fields
            if ($field_type === 'country' && isset($response_data[$field_name])) {
                $country_code = $response_data[$field_name];

                // Only process non-empty, valid country codes
                if (!empty($country_code) && is_string($country_code)) {
                    $country_code = trim($country_code);

                    // Validate country code format (should be 2-letter ISO code)
                    if (strlen($country_code) === 2 && ctype_alpha($country_code)) {
                        $country_code = strtoupper($country_code);
                        $country_data = CountryHelper::get_country_by_code($country_code);

                        if ($country_data && is_array($country_data)) {
                            $flag_svg = isset($country_data['flagSvg']) ? $country_data['flagSvg'] : '';
                            $country_name = isset($country_data['label']) ? $country_data['label'] : $country_code;

                            // Create enhanced display with flag and name
							$flag = CountryHelper::display_country_flag($country_code);
							$response_data[$field_name] = $flag . ' ' . esc_html($country_name);
                            // $response_data[$field_name] = self::format_country_display($country_code, $country_name, $flag_svg);
                        } else {
                            // If country data not found, display the code as-is
                            $response_data[$field_name] = esc_html($country_code);
                        }
                    }
                }
            }

            // Handle phone fields with separate country selection
            if ($field_type === 'phone') {
                $country_field_name = $field_name . '_country';
                $phone_number = isset($response_data[$field_name]) ? $response_data[$field_name] : '';

                if (isset($response_data[$country_field_name])) {
                    $country_code = $response_data[$country_field_name];

                    // Only process non-empty, valid country codes
                    if (!empty($country_code) && is_string($country_code)) {
                        $country_code = trim($country_code);

                        // Validate country code format (should be 2-letter ISO code)
                        if (strlen($country_code) === 2 && ctype_alpha($country_code)) {
                            $country_code = strtoupper($country_code);
                            $country_data = CountryHelper::get_country_by_code($country_code);

                            if ($country_data && is_array($country_data)) {
                                $flag_svg = isset($country_data['flagSvg']) ? $country_data['flagSvg'] : '';
                                $country_name = isset($country_data['label']) ? $country_data['label'] : $country_code;

                                // Create enhanced display with flag and name for country field
                                $flag = CountryHelper::display_country_flag($country_code);
                                $response_data[$country_field_name] = $flag . ' ' . esc_html($country_name);

                                // Also enhance the phone number field to show flag with phone number
                                if (!empty($phone_number)) {
                                    $response_data[$field_name] = $flag . ' ' . esc_html($phone_number);
                                }
                            } else {
                                // If country data not found, display the code as-is
                                $response_data[$country_field_name] = esc_html($country_code);
                            }
                        }
                    }
                }
            }
        }

        return $response_data;
    }

    /**
     * Export as CSV function
     */
    public static function export_as_csv(
        $data,
        $columns = [],
        $filename = "export-data.csv"
    ) {
        if (count($data) == 0) {
            return false;
        }

        ob_start(); // Start output buffering

        //Modify Headers
        header("Content-Type: text/csv; charset=utf-8");
        header("Content-Disposition: attachment; filename=" . $filename);

        $output = fopen("php://output", "w");

        // Output data
        if (count($columns) > 0) {
            // Output CSV header
            fputcsv($output, $columns);
            foreach ($data as $row) {
                $reorder = Helper::reorder_array($row, $columns);
                fputcsv($output, $reorder);
            }
        } else {
            fputcsv($output, $data);
        }

        fclose($output);
        // ob_end_flush();

        exit();
    }

    /**
     * Prepare CSV string data
     */
    public static function prepare_csv_data($data, $columns = [])
    {
        if (count($data) == 0) {
            return "";
        }

        $final_data = [];
        $csv = "";

        // Output data
        if (count($columns) > 0) {
            $csv .= implode(",", $columns) . "\n";
            foreach ($data as $row) {
                $final_data[] = Helper::reorder_array($row, $columns);
            }
        } else {
            $final_data = $data;
        }

        $csv = "";

        foreach ($final_data as $row) {
            $rowValues = array_map(function ($value) {
                return '"' . str_replace('"', '""', $value) . '"';
            }, $row);

            $csv .= implode(",", $rowValues) . "\n";
        }

        return $csv;
    }

    /**
     * Function for reorder array
     */
    public static function reorder_array($arrayToReorder, $referenceArray)
    {
        $reorderedArray = [];

        foreach ($referenceArray as $key => $value) {
            if (isset($arrayToReorder[$key])) {
                $reorderedArray[$key] = $arrayToReorder[$key];
            }
        }

        return $reorderedArray;
    }

    /**
     * Hightlight search keyword
     *
     * @param string $content
     * @param string $search
     *
     * @return string
     */
    public static function highlight_search_keyword($content, $search)
    {
        $search_keys = implode("|", explode(" ", $search));
        $content = preg_replace(
            "/(" . $search_keys . ")/iu",
            "<strong>$1</strong>",
            $content
        );

        return $content;
    }

    /**
     * Insert a value or key/value pair after a specific key in an array.  If key doesn't exist, value is appended
     * to the end of the array.
     *
     * @param array $array
     * @param string $key
     * @param array $new
     *
     * @return array
     */
    public static function array_insert_after(
        $array,
        $key,
        $new,
        $associative = false
    ) {
        $keys = array_keys($array);
        $index = array_search($key, $keys, true);
        $pos = false === $index ? count($array) : $index + 1;

        if ($associative) {
            return array_slice($array, 0, $pos, true) +
                $new +
                array_slice($array, $pos, count($array) - 1, true);
        } else {
            return array_merge(
                array_slice($array, 0, $pos),
                $new,
                array_slice($array, $pos)
            );
        }
    }
    /**
     * make select/radio/checkbox options
     *
     * @param string $input_string
     *
     * @return array
     */
    public static function parse_options_from_string($input_string)
    {
        $lines = explode("\n", $input_string);
        $options = array_map(
            function ($line, $index) {
                $value = preg_replace("/\s+/", "_", $line);
                return ["name" => trim($line), "value" => $value];
            },
            $lines,
            array_keys($lines)
        );

        return $options;
    }
    /**
     * replace options with new value
     *
     * @param string $content
     * @param array $new_options
     *
     * @return string
     */
    public static function replace_options_in_content($content, $new_options)
    {
        // Regex pattern to match options within the select element
        $select_pattern = "/<select[^>]*>(.*?)<\/select>/s";
        $radio_pattern = '/<div class="eb-radio-inputarea">(.*?)<\/div>/s';
        $checkbox_pattern = '/<div class="eb-checkbox-inputarea">(.*?)<\/div>/s';

        // Determine the form field type and apply corresponding replacement logic
        if (preg_match($select_pattern, $content)) {
            $content = self::replace_select_options($content, $new_options);
        } elseif (preg_match($radio_pattern, $content)) {
            $content = self::replace_radio_checkbox_inputs($content, $new_options, 'radio');
        } elseif (preg_match($checkbox_pattern, $content)) {
            $content = self::replace_radio_checkbox_inputs($content, $new_options, 'checkbox');
        }

        return $content;
    }
    /**
     * replace select options and return new content
     *
     * @param string $content
     * @param array $new_options
     *
     * @return string
     */
    public static function replace_select_options($content, $new_options)
    {
        $pattern = "/<select[^>]*>(.*?)<\/select>/s";
        // Replace options with new values
        $content = preg_replace_callback(
            $pattern,
            function ($matches) use ($new_options) {
                $selectContent = '<option value="">Select Item</option>';
                foreach ($new_options as $option) {
                    $selectContent .=
                        '<option value="' .
                        strip_tags($option["value"]) .
                        '">' .
                        strip_tags($option["name"]) .
                        "</option>";
                }
                return "<select " .
                    self::get_html_tag_attribute($matches[0]) .
                    ">" .
                    $selectContent .
                    "</select>";
            },
            $content
        );

        return $content;
    }
    /**
     * Replace radio & checkbox input content
     *
     * @param string $content
     * @param array $new_options
     * @param string $input_type
     *
     * @return string
     */
    public static function replace_radio_checkbox_inputs($content, $new_options, $input_type)
    {
        // Regex pattern to match input areas
        $input_pattern = '';
        $input_tag = '';
        if ($input_type === 'radio') {
            $input_pattern = '/<div class="eb-radio-inputarea">(.*?)<\/div>/s';
            $input_tag = 'radio';
        } elseif ($input_type === 'checkbox') {
            $input_pattern = '/<div class="eb-checkbox-inputarea">(.*?)<\/div>/s';
            $input_tag = 'checkbox';
        } else {
            // Unsupported input type
            return $content;
        }

        $is_replaced = false;

        // Capture the name attribute value from the original content
        preg_match('/name="([^"]+)"/', $content, $name_match);
        $name_attribute = isset($name_match[1]) ? $name_match[1] : '';

        // Replace input areas with new values
        $content = preg_replace_callback(
            $input_pattern,
            function ($matches) use ($new_options, $name_attribute, $input_tag, &$is_replaced) {
                if ($is_replaced) {
                    return "";
                }
                $is_replaced = true;
                $newInputs = "";
                foreach ($new_options as $option) {
                    // Generate new input for each option
                    $newInputs .=
                        '<div class="eb-' . $input_tag . '-inputarea"><label for="' .
                        strip_tags($option["value"]) .
                        '"><input id="' .
                        strip_tags($option["value"]) .
                        '" name="' . $name_attribute . '" value="' .
                        strip_tags($option["value"]) .
                        '" type="' . $input_tag . '"> ' .
                        $option["name"] .
                        "</label></div>";
                }

                return $newInputs;
            },
            $content
        );

        return $content;
    }
    /**
     * get html attribute
     *
     * @param string $html
     *
     * @return string
     */
    public static function get_html_tag_attribute($html)
    {
        preg_match("/<select([^>]*)>/i", $html, $matches);

        if (isset($matches[1])) {
            return $matches[1];
        }
        return "";
    }

    public static function populate_google_sheet_data($content, $use_header)
    {
        // Initialize heading row and data rows based on the use_header flag
        $heading_row = [];
        $data_rows = [];

        if ($use_header) {
            $heading_row = array_shift($content);
            $data_rows = $content;
        } else {
            $data_rows = $content;
        }

        $is_valid_data = true;
        $first = array_shift($heading_row); // Skip the first heading
        $data_set_names = $heading_row; // Remaining headings are dataset names

        $parsed_categories = [];
        $parsed_datasets = [];

        // Initialize parsed datasets
        if ($use_header) {
            foreach ($data_set_names as $i => $name) {
                $parsed_datasets[] = [
                    'name' => $name ?: "Dataset " . ($i + 1),
                    'data' => []
                ];
            }
        } else {
            // When not using category dataset, create datasets based on the first data row length
            for ($i = 0; $i < count($data_rows[0]); $i++) {
                $parsed_datasets[] = [
                    'name' => "Dataset " . ($i + 1),
                    'data' => []
                ];
            }
        }

        // Parse each data row
        foreach ($data_rows as $index => $each) {
            if (!$is_valid_data) {
                break;
            }

            if (!empty($each)) {
                // Set category name
                $parsed_categories[] = $use_header ? ($each[0] ?: "Item " . ($index + 1)) : "Item " . ($index + 1);

                // Iterate over data items in each row
                foreach ($each as $i => $item) {
                    if ($i !== 0 || !$use_header) { // Skip first column if using category dataset
                        $data = floatval($item);
                        if (!is_numeric($item) || is_nan($data)) {
                            $is_valid_data = false; // Invalid data found, exit
                            break;
                        }
                        // Determine the correct dataset based on the index
                        $set_index = $use_header ? $i - 1 : $i;
                        $parsed_datasets[$set_index]['data'][] = $data;
                    }
                }
            }
        }

        // If data is not valid, return false
        if (!$is_valid_data) {
            return false;
        }

        // Return parsed categories and datasets
        return [
            'categories' => $parsed_categories,
            'dataSets' => $parsed_datasets,
        ];
    }

    public static function populate_data_table_google_sheet($results, $useGoogleAsColumn)
    {
        if (empty($results) || !is_array($results)) {
            return false;
        }

        $data = [];
        if ($useGoogleAsColumn) {
            // Use Google Sheet first row as column headers
            $dataColumns = self::make_table_header($results);
            $data['columns'] = [
                'col' => $dataColumns,
                'width' => ''
            ];
            // Sanitize and process rows, skipping the first row
            $data['rows'] = array_map(function ($row) {
                return array_map([self::class, 'sanitize'], $row);
            }, array_slice($results, 1));
        } else {
            // Generate default column headers (Column 1, Column 2, etc.)
            $columnCount = self::findMaxCount($results);
            $dataColumns = array_map(function ($i) {
                return "Column " . ($i + 1);
            }, range(0, $columnCount - 1));

            $data['columns'] = [
                'col' => $dataColumns,
                'width' => ''
            ];
            // Sanitize and process all rows
            $data['rows'] = array_map(function ($row) {
                return array_map([self::class, 'sanitize'], $row);
            }, $results);
        }

        return $data;
    }

    public static function findMaxCount($array) {
        $max = 0;
        foreach ($array as $row) {
            $count = count($row);
            if ($count > $max) {
                $max = $count;
            }
        }
        return $max;
    }

    public static function make_table_header($value)
    {
        $columns = [];
        $maxCount = self::findMaxCount($value);

        if (empty($value[0]) || !is_array($value[0])) {
            // If the first row is empty, generate default column names
            for ($i = 0; $i < $maxCount; $i++) {
                $columns[] = "Column " . ($i + 1);
            }
        } else {
            // Generate column headers based on the first row
            for ($i = 0; $i < $maxCount; $i++) {
                $columns[] = (!isset($value[0][$i]) || $value[0][$i] === "")
                    ? "Column " . ($i + 1)
                    : $value[0][$i];
            }
        }

        return $columns;
    }

    private static function sanitize($data) {
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
}
