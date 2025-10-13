import { useNotificationStore, type NotificationInput, type NotificationType } from "@/stores/notifications";

interface NotifyOptions extends NotificationInput {}

export const useNotifications = () => {
    const store = useNotificationStore();

    const notify = (options: NotifyOptions) => {
        return store.add(options);
    };

    const success = (
        message: string,
        title?: string,
        duration?: number,
    ) =>
        notify({
            message,
            title,
            duration,
            type: "success",
        });

    const error = (
        message: string,
        title?: string,
        duration?: number,
    ) =>
        notify({
            message,
            title,
            duration,
            type: "error",
        });

    const remove = (id: number) => store.remove(id);

    return {
        notify,
        success,
        error,
        remove,
    };
};
