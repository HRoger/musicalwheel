/**
 * Shared Undo/Reset Icon
 * 
 * Used for reset buttons across various controls.
 * Uses WordPress Dashicon 'image-rotate' (circular arrow).
 */

const UndoIcon = () => (
    <span
        className="dashicons dashicons-image-rotate"
        style={{
            fontSize: '16px',
            width: '16px',
            height: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    />
);

export default UndoIcon;
