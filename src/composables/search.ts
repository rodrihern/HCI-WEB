import {
    computed,
    inject,
    ref,
    watch,
    type ComputedRef,
    type Ref,
} from "vue";

export interface UseSearchOptions {
    onSearch?: (
        query: string,
    ) => void | Promise<void>;
    onReset?: () => void | Promise<void>;
    immediate?: boolean;
}

export interface UseGlobalSearchResult {
    searchQuery: Ref<string>;
    trimmedQuery: ComputedRef<string>;
    normalizedQuery: ComputedRef<string>;
    isSearching: ComputedRef<boolean>;
}

export function useGlobalSearch(
    options: UseSearchOptions = {},
): UseGlobalSearchResult {
    const searchQuery = inject<Ref<string>>(
        "searchQuery",
        ref(""),
    );

    const trimmedQuery = computed(() =>
        searchQuery.value.trim(),
    );
    const normalizedQuery = computed(() =>
        trimmedQuery.value.toLowerCase(),
    );
    const isSearching = computed(
        () => trimmedQuery.value.length > 0,
    );

    if (
        options.onSearch ||
        options.onReset
    ) {
        watch(
            trimmedQuery,
            async (newQuery, oldQuery) => {
                if (newQuery) {
                    await options.onSearch?.(
                        newQuery,
                    );
                } else if (oldQuery) {
                    await options.onReset?.();
                } else if (
                    options.immediate
                ) {
                    await options.onReset?.();
                }
            },
            {
                immediate:
                    options.immediate ??
                    false,
            },
        );
    }

    return {
        searchQuery,
        trimmedQuery,
        normalizedQuery,
        isSearching,
    };
}

export function useSearchFilter<T>(
    items: Ref<T[]>,
    predicate: (
        item: T,
        normalizedQuery: string,
    ) => boolean,
    options?: UseSearchOptions,
) {
    const {
        searchQuery,
        normalizedQuery,
        trimmedQuery,
        isSearching,
    } = useGlobalSearch(options);

    const filteredItems = computed(() => {
        if (!trimmedQuery.value) {
            return items.value;
        }

        return items.value.filter((item) =>
            predicate(item, normalizedQuery.value),
        );
    });

    const hasResults = computed(
        () => filteredItems.value.length > 0,
    );

    return {
        searchQuery,
        isSearching,
        filteredItems,
        hasResults,
    };
}
