import { notifyAlert } from './notification';

/**
 * App-wide confirmation dialog using shared notification modal UI.
 */
export function confirmAction(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'OK',
    cancelText = 'Hủy'
) {
    notifyAlert(title, message, [
        { text: cancelText, style: 'cancel' },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
}

/**
 * Destructive confirm — red confirm button, gray cancel.
 */
export function confirmDestructive(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Xác nhận',
) {
    confirmAction(title, message, onConfirm, confirmText);
}
