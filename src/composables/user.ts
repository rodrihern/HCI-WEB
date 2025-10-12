import {
  computed,
  onMounted,
} from "vue";
import {
  Credentials,
  type CredentialsData,
  type UserData,
  type ChangePasswordData,
} from "@/api/user";
import { useUserStore } from "@/stores2/user";
import { useLog } from "./log";

export function useUser() {
  const { log, error } = useLog();
  const userStore = useUserStore();

  const isLoggedIn = computed(() => {
    return userStore.isLoggedIn;
  });

  const user = computed(() => {
    return userStore.user;
  });

  async function login(
    email: string,
    password: string,
  ): Promise<void> {
    try {
      const credentials: CredentialsData =
        { email, password };
      log(
        await userStore.login(
          credentials,
          true,
        ),
      );
    } catch (e) {
      error(e);
    }
  }

  async function logout(): Promise<void> {
    log(await userStore.logout());
  }

  async function getProfile(): Promise<void> {
    try {
      log(await userStore.getProfile());
    } catch (e) {
      error(e);
    }
  }

  async function updateProfile(
    data: Partial<UserData>,
  ): Promise<void> {
    try {
      log(
        await userStore.updateProfile(
          data,
        ),
      );
    } catch (e) {
      error(e);
      throw e;
    }
  }

  async function changePassword(
    data: ChangePasswordData,
  ): Promise<void> {
    try {
      await userStore.changePassword(
        data,
      );
    } catch (e) {
      error(e);
      throw e;
    }
  }

  onMounted(async () => {
    userStore.initialize();
  });

  return {
    user,
    isLoggedIn,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
  };
}
