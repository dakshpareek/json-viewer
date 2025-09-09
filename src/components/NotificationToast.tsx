import React, { useEffect, useState, useCallback } from 'react';
import './NotificationToast.css';

interface NotificationToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
    message,
    type,
    duration = 3000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const handleClose = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match CSS transition duration
    }, [onClose]);

    useEffect(() => {
        // Trigger entrance animation
        setIsVisible(true);

        // Auto-close after duration
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, handleClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div
            className={`notification-toast ${type} ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
            role="alert"
            aria-live="polite"
        >
            <div className="notification-content">
                <span className="notification-icon">{getIcon()}</span>
                <span className="notification-message">{message}</span>
                <button
                    className="notification-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default NotificationToast;
