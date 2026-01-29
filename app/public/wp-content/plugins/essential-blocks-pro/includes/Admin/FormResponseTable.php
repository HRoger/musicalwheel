<?php

namespace EssentialBlocks\Pro\Admin;

use EssentialBlocks\Pro\Utils\Helper;

// WP_List_Table is not loaded automatically so we need to load it in our application
if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Create a new table class that will extend the WP_List_Table
 */
class FormResponseTable extends \WP_List_Table {

    private $form_id;
    private $form_fields = [];

    public function __construct( $form_id = '', $form_fields = [] ) {
        parent::__construct();

        $this->form_id     = $form_id;
        $this->form_fields = $form_fields;
    }

    /**
     * Prepare the items for the table to process
     *
     */
    public function prepare_items() {
        $columns  = $this->get_columns();
        $hidden   = $this->get_hidden_columns();
        $sortable = $this->get_sortable_columns();

        if ( isset( $_POST['s'] ) ) {
            $data = $this->table_data( $_POST['s'] );
        } else {
            $data = $this->table_data();
        }

        $perPage     = 10;
        $currentPage = $this->get_pagenum();
        $totalItems  = count( $data );

        $this->set_pagination_args( [
            'total_items' => $totalItems,
            'per_page'    => $perPage
        ] );

        $data = array_slice( $data, (  ( $currentPage - 1 ) * $perPage ), $perPage );

        $this->_column_headers = [$columns, $hidden, $sortable];
        $this->items           = $data;
    }

    /**
     * Override the parent columns method. Defines the columns to use in your listing table
     *
     */
    public function get_columns() {
		return Helper::get_form_columns($this->form_id);
    }

    /**
     * Define which columns are hidden
     *
     */
    public function get_hidden_columns() {
        return [];
    }

    /**
     * Define the sortable columns
     *
     */
    // public function get_sortable_columns() {
    //     return [
    //         'title'        => ['title', false],
    //         'email'        => ['email', false],
    //         'email_status' => ['email_status', false],
    //         'submitted_at' => ['submitted_at', false]
    //     ];
    // }

    /**
     * Get the table data
     *
     */
    private function table_data( $search = "" ) {
        return Helper::form_response_table_data( $this->form_id, $search );
    }

    /**
     * Define what data to show on each column of the table
     *
     */
    public function column_default( $item, $column_name ) {
        if ( isset( $item[$column_name] ) ) {
            return $item[$column_name];
        }
    }

    /**
     * Allows you to sort the data by the variables set in the $_GET
     *
     */
    private function sort_data( $a, $b ) {
        // Set defaults
        $orderby = 'title';
        $order   = 'asc';

        // If orderby is set, use this as the sort column
        if ( ! empty( $_GET['orderby'] ) ) {
            $orderby = $_GET['orderby'];
        }

        // If order is set use this as the order
        if ( ! empty( $_GET['order'] ) ) {
            $order = $_GET['order'];
        }

        $result = strcmp( $a[$orderby], $b[$orderby] );

        if ( $order === 'asc' ) {
            return $result;
        }

        return -$result;
    }

    // To show bulk action dropdown
    // protected function get_bulk_actions() {
    //     $actions = [
    //         'delete_all' => __( 'Delete', 'essential-blocks-pro' ),
    //         'export'     => __( 'Export', 'essential-blocks-pro' )
    //     ];
    //     return $actions;
    // }
}
?>
