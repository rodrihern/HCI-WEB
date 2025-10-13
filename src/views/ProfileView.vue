<script setup lang="ts">
import {
    ref,
    computed,
    onMounted,
    
} from "vue";
import { useRouter } from "vue-router";
import { useUser } from "@/composables/user";
import ChangePasswordModal from "@/components/ChangePasswordModal.vue";
import { useNotifications } from "@/composables/notifications";

const router = useRouter();
const {
    user: currentUser,
    updateProfile,
    changePassword: changeUserPassword,
    getProfile,
} = useUser();
const {
    success: notifySuccess,
    error: notifyError,
} = useNotifications();

const profileData = ref({
    name: "",
    surname: "",
    email: "",
    avatar: null as string | null,
});

const isEditingName = ref(false);
const isEditingSurname = ref(false);
const tempName = ref("");
const tempSurname = ref("");
const loading = ref(false);
const showChangePasswordModal =
    ref(false);

// Load user profile on mount
onMounted(async () => {
    await loadProfile();
});

const loadProfile = async () => {
    try {
        loading.value = true;
        // Force reload to get latest data
        await getProfile(true);

        if (currentUser.value) {
            profileData.value.name =
                currentUser.value.name;
            profileData.value.surname =
                currentUser.value.surname;
            profileData.value.email =
                currentUser.value.email;
            // Cargar avatar desde metadata si existe
            if (
                currentUser.value
                    .metadata?.avatar
            ) {
                profileData.value.avatar =
                    currentUser.value.metadata.avatar;
            }
        }
    } catch (e: any) {
        console.error(
            "Error loading profile:",
            e,
        );
        notifyError(
            "Error al cargar el perfil",
        );
    } finally {
        loading.value = false;
    }
};

const handleFileChange = async (
    event: Event,
) => {
    const target =
        event.target as HTMLInputElement;
    if (
        target.files &&
        target.files[0]
    ) {
        const file = target.files[0];

        // Validar tamaño (máximo 2MB)
        if (
            file.size >
            2 * 1024 * 1024
        ) {
            notifyError(
                "La imagen no puede superar los 2MB",
            );
            return;
        }

        // Validar tipo
        if (
            !file.type.startsWith(
                "image/",
            )
        ) {
            notifyError(
                "Solo se permiten imágenes",
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const avatar = e.target
                ?.result as string;
            profileData.value.avatar =
                avatar;

            // Guardar en el backend
            try {
                loading.value = true;

                await updateProfile({
                    name: profileData
                        .value.name,
                    surname:
                        profileData
                            .value
                            .surname,
                    metadata: {
                        ...currentUser
                            .value
                            ?.metadata,
                        avatar: avatar,
                    },
                });

                notifySuccess(
                    "Foto de perfil actualizada exitosamente",
                );
            } catch (e: any) {
                console.error(
                    "Error updating avatar:",
                    e,
                );
                const message =
                    typeof e?.message === "string" &&
                    e.message
                        .toLowerCase()
                        .includes("failed to fetch")
                        ? "No pudimos actualizar tu foto. Verificá tu conexión e intentá nuevamente."
                        : e?.message ||
                          "Error al actualizar la foto de perfil";
                notifyError(message);
                profileData.value.avatar =
                    currentUser.value
                        ?.metadata
                        ?.avatar ||
                    null;
            } finally {
                loading.value = false;
            }
        };
        reader.readAsDataURL(file);
    }
};

const triggerFileInput = () => {
    const fileInput =
        document.getElementById(
            "avatar-input",
        ) as HTMLInputElement;
    fileInput?.click();
};

const startEditingName = () => {
    isEditingName.value = true;
    tempName.value =
        profileData.value.name;
};

const saveName = async () => {
    if (!tempName.value.trim()) {
        notifyError(
            "El nombre no puede estar vacío",
        );
        return;
    }

    try {
        loading.value = true;

        await updateProfile({
            name: tempName.value.trim(),
            surname:
                profileData.value
                    .surname,
        });

        profileData.value.name =
            tempName.value.trim();
        isEditingName.value = false;
        notifySuccess(
            "Nombre actualizado exitosamente",
        );
    } catch (e: any) {
        console.error(
            "Error updating name:",
            e,
        );
        notifyError(
            e.message ||
                "Error al actualizar el nombre",
        );
    } finally {
        loading.value = false;
    }
};

const cancelEditName = () => {
    isEditingName.value = false;
    tempName.value =
        profileData.value.name;
};

const startEditingSurname = () => {
    isEditingSurname.value = true;
    tempSurname.value =
        profileData.value.surname;
};

const saveSurname = async () => {
    if (!tempSurname.value.trim()) {
        notifyError(
            "El apellido no puede estar vacío",
        );
        return;
    }

    try {
        loading.value = true;

        await updateProfile({
            name: profileData.value
                .name,
            surname:
                tempSurname.value.trim(),
        });

        profileData.value.surname =
            tempSurname.value.trim();
        isEditingSurname.value = false;
        notifySuccess(
            "Apellido actualizado exitosamente",
        );
    } catch (e: any) {
        console.error(
            "Error updating surname:",
            e,
        );
        notifyError(
            e.message ||
                "Error al actualizar el apellido",
        );
    } finally {
        loading.value = false;
    }
};

const cancelEditSurname = () => {
    isEditingSurname.value = false;
    tempSurname.value =
        profileData.value.surname;
};

const openChangePasswordModal = () => {
    showChangePasswordModal.value = true;
};

const closeChangePasswordModal = () => {
    showChangePasswordModal.value = false;
};

const handleChangePassword =
    async (data: {
        currentPassword: string;
        newPassword: string;
    }) => {
        try {
            loading.value = true;

            await changeUserPassword({
                currentPassword:
                    data.currentPassword,
                newPassword:
                    data.newPassword,
            });

            closeChangePasswordModal();
            notifySuccess(
                "Contraseña cambiada exitosamente",
            );
        } catch (e: any) {
            console.error(
                "Error changing password:",
                e,
            );
            notifyError(
                e.message ||
                    "Error al cambiar la contraseña. Verificá que la contraseña actual sea correcta.",
            );
        } finally {
            loading.value = false;
        }
    };

const initials = computed(() => {
    if (
        !profileData.value.name ||
        !profileData.value.surname
    )
        return "";
    return `${profileData.value.name[0]}${profileData.value.surname[0]}`.toUpperCase();
});
</script>

<template>
    <div
        class="min-h-screen bg-fondo flex justify-center px-8 py-12"
    >
        <div
            class="max-w-4xl w-full flex flex-col gap-10"
        >
            <!-- Loading State -->
            <div
                v-if="
                    loading &&
                    !profileData.name
                "
                class="flex justify-center items-center py-20"
            >
                <svg
                    class="animate-spin h-12 w-12 text-verde-sidebar"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                    ></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>

            <template v-else>
                <!-- Two-column responsive layout: avatar left, details right -->
                <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                    <!-- Left column: Avatar -->
                    <div class="w-full md:w-auto flex flex-col items-center md:items-start flex-shrink-0">
                        <div class="w-[200px] h-[200px] rounded-full overflow-hidden shadow-lg">
                            <div
                                v-if="profileData.avatar"
                                class="w-full h-full bg-cover bg-center"
                                :style="{ backgroundImage: `url(${profileData.avatar})` }"
                            ></div>
                            <div
                                v-else
                                class="w-full h-full bg-verde-sidebar flex items-center justify-center"
                            >
                                <span v-if="initials" class="text-6xl font-bold text-white">{{ initials }}</span>
                                <svg v-else class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                        </div>
                        <button @click="triggerFileInput" class="text-verde-sidebar hover:cursor-pointer text-lg font-semibold px-4 py-2 hover:opacity-70 transition-opacity mt-4">
                            Cambiar foto de perfil
                        </button>
                        <input id="avatar-input" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
                    </div>

                    <!-- Right column: Details -->
                    <div class="flex-1 flex flex-col gap-6 w-full">
                        <!-- Name Section -->
                        <div class="flex flex-col gap-2">
                            <label class="text-2xl font-bold text-gray-900">Nombre</label>
                            <div class="bg-white rounded-lg p-4 shadow-sm">
                                <div v-if="!isEditingName" class="flex items-center justify-between">
                                    <span class="text-lg text-gray-500">{{ profileData.name }}</span>
                                    <button @click="startEditingName" class="text-verde-sidebar p-1 hover:cursor-pointer hover:opacity-70 transition-opacity">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                <div v-else class="flex flex-col gap-4">
                                    <input v-model="tempName" type="text" maxlength="25" class="w-full px-2 py-2 text-lg border-2 border-verde-sidebar rounded-md outline-none" @keyup.enter="saveName" @keyup.esc="cancelEditName" />
                                    <div class="flex gap-3 justify-end">
                                        <button @click="saveName" class="px-5 py-2 bg-verde-sidebar text-white font-semibold rounded-md hover:opacity-80 transition-opacity">Guardar</button>
                                        <button @click="cancelEditName" class="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:opacity-80 transition-opacity">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Surname Section -->
                        <div class="flex flex-col gap-2">
                            <label class="text-2xl font-bold text-gray-900">Apellido</label>
                            <div class="bg-white rounded-lg p-4 shadow-sm">
                                <div v-if="!isEditingSurname" class="flex items-center justify-between">
                                    <span class="text-lg text-gray-500">{{ profileData.surname }}</span>
                                    <button @click="startEditingSurname" class="text-verde-sidebar p-1 hover:cursor-pointer hover:opacity-70 transition-opacity">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                <div v-else class="flex flex-col gap-4">
                                    <input v-model="tempSurname" type="text" maxlength="25" class="w-full px-2 py-2 text-lg border-2 border-verde-sidebar rounded-md outline-none" @keyup.enter="saveSurname" @keyup.esc="cancelEditSurname" />
                                    <div class="flex gap-3 justify-end">
                                        <button @click="saveSurname" class="px-5 py-2 bg-verde-sidebar text-white font-semibold rounded-md hover:opacity-80 transition-opacity">Guardar</button>
                                        <button @click="cancelEditSurname" class="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:opacity-80 transition-opacity">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Email Section -->
                        <div class="flex flex-col gap-2">
                            <label class="text-2xl font-bold text-gray-900">Mail</label>
                            <div class="bg-white rounded-lg p-4 shadow-sm">
                                <span class="text-lg text-gray-500">{{ profileData.email }}</span>
                            </div>
                        </div>

                        <!-- Change Password Button -->
                        <div class="flex justify-center">
                            <button @click="openChangePasswordModal" class="bg-verde-sidebar hover:cursor-pointer text-white text-lg font-semibold px-8 py-3 rounded-xl flex items-center shadow-lg hover:bg-verde-contraste hover:-translate-y-0.5 transition-all">
                                <span class="material-icons mr-2">key</span>
                                Cambiar contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Change Password Modal -->
        <ChangePasswordModal
            :show="
                showChangePasswordModal
            "
            :loading="loading"
            @close="
                closeChangePasswordModal
            "
            @save="handleChangePassword"
        />
    </div>
</template>
