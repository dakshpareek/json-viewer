import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationToast from '../components/NotificationToast.tsx';

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface NotificationContextType {
    showNotification: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
    hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (
        message: string,
        type: 'success' | 'error' | 'info' = 'info',
        duration: number = 3000
    ) => {
        const id = Date.now().toString();
        const notification: Notification = {
            id,
            message,
            type,
            duration,
        };

        setNotifications(prev => [...prev, notification]);
    };

    const hideNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            <div className="notification-container">
                {notifications.map(notification => (
                    <NotificationToast
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        duration={notification.duration}
                        onClose={() => hideNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
