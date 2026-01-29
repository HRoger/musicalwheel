/**
 * Template Editor Override for FSE
 *
 * Redirects Voxel template edit links to WordPress Site Editor.
 */
(function($) {
    'use strict';

    // Override template edit links when page loads
    $(document).ready(function() {
        // Find all Voxel template edit links
        $('a[href*="voxel_template_editor"]').each(function() {
            const $link = $(this);
            const templateId = $link.data('template-id');

            if (templateId) {
                // Redirect to Site Editor
                const siteEditorUrl = voxelFSE.siteEditorUrl + '?postId=' + templateId + '&postType=wp_template';
                $link.attr('href', siteEditorUrl);
            }
        });
    });

    // Helper function for future use
    window.voxelEditWithFSE = function(templateId) {
        const url = voxelFSE.siteEditorUrl + '?postId=' + templateId + '&postType=wp_template';
        window.location.href = url;
    };

})(jQuery);