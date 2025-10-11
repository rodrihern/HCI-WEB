<script setup lang="ts">
import {
    RouterView,
    useRoute,
    useRouter,
} from "vue-router";
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores2/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isSidebarExpanded = ref(false);
const isHoverExpanded = ref(false);
const hoverTimeout = ref<number | null>(
    null,
);
const searchQuery = ref("");
const showProfileMenu = ref(false);

// Initialize user store on mount
onMounted(() => {
    userStore.initialize();
});

const searchPlaceholder = computed(
    () => {
        switch (route.path) {
            case "/listas":
                return "Busca tus listas";
            case "/despensa":
                return "Busca en tu despensa";
            case "/productos":
                return "Busca productos";
            case "/historial":
                return "Busca en tu historial";
            default:
                return "Buscar...";
        }
    },
);

const toggleSidebar = () => {
    isSidebarExpanded.value =
        !isSidebarExpanded.value;
};

const handleMenuHover = (
    event: MouseEvent,
) => {
    if (isSidebarExpanded.value) return; // Don't hover expand if already expanded

    // Check if the hover is on the top section (burger menu area)
    const target =
        event.target as HTMLElement;
    const topSection = target.closest(
        "[data-top-section]",
    );
    if (topSection) return; // Don't expand if hovering on top section

    // Check if the hover is in the top 72px of the sidebar (same height as top section)
    const navElement =
        target.closest("nav");
    if (navElement) {
        const rect =
            navElement.getBoundingClientRect();
        const relativeY =
            event.clientY - rect.top;
        if (relativeY <= 72) return; // Don't expand if hovering in top 72px
    }

    if (hoverTimeout.value) {
        clearTimeout(
            hoverTimeout.value,
        );
    }

    hoverTimeout.value = setTimeout(
        () => {
            isHoverExpanded.value = true;
        },
        300,
    ); // 300ms delay
};

const handleMenuLeave = () => {
    if (hoverTimeout.value) {
        clearTimeout(
            hoverTimeout.value,
        );
        hoverTimeout.value = null;
    }

    setTimeout(() => {
        isHoverExpanded.value = false;
    }, 100); // Small delay before hiding
};

const goToProfile = () => {
    showProfileMenu.value = false;
    router.push("/profile");
};

const handleLogout = async () => {
    showProfileMenu.value = false;
    try {
        await userStore.logout();
        router.push('/login');
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        router.push('/login');
    }
};

const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value;
};

// Close profile menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu-container')) {
        showProfileMenu.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});
</script>

<template>
    <div
        v-if="
            route.path === '/login' ||
            route.path === '/register'
        "
        class="min-h-screen bg-[#FEFFF7]"
    >
        <RouterView />
    </div>
    <div
        v-else
        class="flex flex-col h-screen bg-[#FEFFF7] relative"
    >
        <!-- Top Header - por encima de todo -->
        <header
            class="bg-[#FEFFF7] border-b border-gray-200 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-30"
            style="height: 72px"
        >
            <!-- Left side: Burger menu -->
            <div
                class="flex items-center gap-4"
            >
                <button
                    @click="
                        toggleSidebar
                    "
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg
                        class="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <use
                            href="@/assets/sprite.svg#hamburger-menu"
                        />
                    </svg>
                </button>
            </div>

            <!-- Center: Search bar -->
            <div
                class="flex-1 max-w-2xl mx-auto px-4"
            >
                <div class="relative">
                    <input
                        v-model="
                            searchQuery
                        "
                        type="text"
                        :placeholder="
                            searchPlaceholder
                        "
                        class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent bg-white"
                    />
                    <button
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <use
                                href="@/assets/sprite.svg#search"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Right side: Logo, Profile -->
            <div
                class="flex items-center gap-4"
            >
                <!-- Logo -->
                <span
                    class="text-2xl font-bold text-verde-sidebar"
                    >Listazo!</span
                >

                <!-- Profile Menu -->
                <div class="relative profile-menu-container">
                    <button
                        @click="toggleProfileMenu"
                        class="w-10 h-10 rounded-full bg-verde-sidebar flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                        <svg
                            class="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                        >
                            <use
                                href="@/assets/sprite.svg#user-profile"
                            />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <Transition name="dropdown">
                        <div
                            v-if="showProfileMenu"
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                        >
                            <button
                                @click="goToProfile"
                                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                                    <use href="@/assets/sprite.svg#user-profile" />
                                </svg>
                                Mi Perfil
                            </button>
                            <hr class="my-1 border-gray-200" />
                            <button
                                @click="handleLogout"
                                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    </Transition>
                </div>
            </div>
        </header>

        <!-- Contenedor para sidebar y contenido principal -->
        <div
            class="flex flex-1 overflow-hidden"
            style="margin-top: 72px"
        >
            <!-- Navbar lateral - debajo del header -->
            <nav
                class="bg-[#FEFFF7] flex flex-col fixed left-0 z-10 overflow-hidden"
                style="
                    transition:
                        width 300ms
                            ease-in-out,
                        border 300ms
                            ease-in-out,
                        box-shadow 300ms
                            ease-in-out;
                "
                :class="[
                    isSidebarExpanded
                        ? 'w-64'
                        : isHoverExpanded
                          ? 'w-64'
                          : 'w-24',
                    isHoverExpanded &&
                    !isSidebarExpanded
                        ? 'border-r border-gray-200 shadow-lg'
                        : '',
                ]"
                :style="{
                    top: '72px',
                    height: 'calc(100vh - 72px)',
                }"
                @mouseenter="
                    handleMenuHover
                "
                @mouseleave="
                    handleMenuLeave
                "
            >
                <!-- Menu items -->
                <div
                    class="flex flex-col items-start py-8 space-y-6"
                >
                    <RouterLink
                        to="/listas"
                        class="relative flex items-center w-full px-4 py-3 gap-4 h-16 transition-all duration-200 rounded-r-full"
                        :class="
                            route.path ===
                            '/listas'
                                ? 'bg-verde-sidebar/50'
                                : 'hover:bg-gray-200'
                        "
                    >
                        <div
                            class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700"
                        >
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <use
                                    href="@/assets/sprite.svg#list-icon"
                                />
                            </svg>
                        </div>
                        <span
                            class="text-gray-700 font-medium transition-opacity duration-300 whitespace-nowrap"
                            :class="
                                isSidebarExpanded
                                    ? 'opacity-100'
                                    : isHoverExpanded
                                      ? 'opacity-100'
                                      : 'opacity-0'
                            "
                            >Listas</span
                        >
                    </RouterLink>

                    <RouterLink
                        to="/productos"
                        class="relative flex items-center w-full px-4 py-3 gap-4 h-16 transition-all duration-200 rounded-r-full"
                        :class="
                            route.path ===
                            '/productos'
                                ? 'bg-verde-sidebar/50'
                                : 'hover:bg-gray-200'
                        "
                    >
                        <div
                            class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700"
                        >
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <use
                                    href="@/assets/sprite.svg#shopping-bag"
                                />
                            </svg>
                        </div>
                        <span
                            class="text-gray-700 font-medium transition-opacity duration-300 whitespace-nowrap"
                            :class="
                                isSidebarExpanded
                                    ? 'opacity-100'
                                    : isHoverExpanded
                                      ? 'opacity-100'
                                      : 'opacity-0'
                            "
                            >Productos</span
                        >
                    </RouterLink>

                    <RouterLink
                        to="/despensa"
                        class="relative flex items-center w-full px-4 py-3 gap-4 h-16 transition-all duration-200 rounded-r-full"
                        :class="
                            route.path ===
                            '/despensa'
                                ? 'bg-verde-sidebar/50'
                                : 'hover:bg-gray-200'
                        "
                    >
                        <div
                            class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700"
                        >
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <use
                                    href="@/assets/sprite.svg#pantry-box"
                                />
                            </svg>
                        </div>
                        <span
                            class="text-gray-700 font-medium transition-opacity duration-300 whitespace-nowrap"
                            :class="
                                isSidebarExpanded
                                    ? 'opacity-100'
                                    : isHoverExpanded
                                      ? 'opacity-100'
                                      : 'opacity-0'
                            "
                            >Despensa</span
                        >
                    </RouterLink>

                    <RouterLink
                        to="/historial"
                        class="relative flex items-center w-full px-4 py-3 gap-4 h-16 transition-all duration-200 rounded-r-full"
                        :class="
                            route.path ===
                            '/historial'
                                ? 'bg-verde-sidebar/50'
                                : 'hover:bg-gray-200'
                        "
                    >
                        <div
                            class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700"
                        >
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <use
                                    href="@/assets/sprite.svg#clock-history"
                                />
                            </svg>
                        </div>
                        <span
                            class="text-gray-700 font-medium transition-opacity duration-300 whitespace-nowrap"
                            :class="
                                isSidebarExpanded
                                    ? 'opacity-100'
                                    : isHoverExpanded
                                      ? 'opacity-100'
                                      : 'opacity-0'
                            "
                            >Historial</span
                        >
                    </RouterLink>
                </div>

                <!-- Logo section - visible when expanded or hovered -->
                <div
                    class="mt-auto pl-10 transition-opacity duration-300"
                    :class="
                        isSidebarExpanded ||
                        isHoverExpanded
                            ? 'opacity-100'
                            : 'opacity-0 pointer-events-none'
                    "
                >
                    <img
                        src="@/assets/Listazo_verde_sin_titulo.png"
                        alt="Menu logo"
                        class="h-40 w-40"
                    />
                </div>
            </nav>

            <!-- Main content - Con padding-left para compensar la sidebar fija -->
            <div
                class="flex-1 flex flex-col overflow-hidden relative"
                style="
                    transition: padding-left
                        300ms
                        ease-in-out;
                "
                :style="{
                    paddingLeft:
                        isSidebarExpanded
                            ? '256px'
                            : '96px',
                }"
            >
                <!-- Page content -->
                <main
                    class="flex-1 overflow-y-scroll"
                >
                    <div
                        class="max-w-4xl mx-auto"
                    >
                        <RouterView />
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
