<template>
    <div
        v-if="show"
        class="text-center text-gray-500 mt-12"
    >
        <p class="text-lg">
            {{
                isSearching
                    ? searchTitle
                    : emptyTitle
            }}
        </p>
        <p
            v-if="
                (isSearching
                    ? searchSubtitle
                    : emptySubtitle
                )?.length
            "
            class="text-sm"
        >
            {{
                isSearching
                    ? searchSubtitle
                    : emptySubtitle
            }}
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    isSearching: {
        type: Boolean,
        default: false,
    },
    emptyTitle: {
        type: String,
        required: true,
    },
    emptySubtitle: {
        type: String,
        default: "",
    },
    searchTitle: {
        type: String,
        default: "No se encontraron resultados",
    },
    searchSubtitle: {
        type: String,
        default: "Intenta con otra búsqueda",
    },
});
</script>
