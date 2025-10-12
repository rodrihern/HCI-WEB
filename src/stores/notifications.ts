import { ref } from "vue";
import { defineStore } from "pinia";

export type NotificationType =
    | "success"
    | "error"
    | "info"
    | "warning";

export interface NotificationEntry {
    id: number;
    type: NotificationType;
    message: string;
    title?: string;
    duration?: number;
}

export interface NotificationInput {
    type?: NotificationType;
    message: string;
    title?: string;
    duration?: number;
}

export const useNotificationStore =
    defineStore("notifications", () => {
        const notifications =
            ref<NotificationEntry[]>([]);
        let counter = 0;
        const timers = new Map<
            number,
            ReturnType<typeof setTimeout>
        >();

        const remove = (id: number) => {
            const timer = timers.get(id);
            if (timer) {
                clearTimeout(timer);
                timers.delete(id);
            }
            notifications.value =
                notifications.value.filter(
                    (notification) =>
                        notification.id !== id,
                );
        };

        const add = (
            input: NotificationInput,
        ) => {
            const id = ++counter;
            const entry: NotificationEntry = {
                id,
                type: input.type || "info",
                message: input.message,
                title: input.title,
                duration: input.duration,
            };

            notifications.value.push(entry);

            if (entry.duration !== 0) {
                const timeout =
                    setTimeout(() => {
                        remove(id);
                    }, entry.duration ?? 4000);
                timers.set(id, timeout);
            }

            return id;
        };

        const clear = () => {
            notifications.value.forEach(
                (notification) =>
                    remove(notification.id),
            );
        };

        return {
            notifications,
            add,
            remove,
            clear,
        };
    });
