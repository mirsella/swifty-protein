<script setup lang="ts">
const auth = useAuth();

const new_username = ref("");
const new_password = ref("");

const error = ref("");
const error_modal = useTemplateRef("error_modal");
onMounted(async () => {
  error_modal.value?.addEventListener("close", () => {
    error.value = "";
  });
});
watch(error, () => {
  if (error.value.length > 0) {
    error_modal.value?.showModal();
  }
});

const login_modal = useTemplateRef("login_modal");
const login_username = ref("");
const login_password = ref("");
async function trylogin(username: string) {
  login_username.value = username;
  try {
    if (await auth.isBiometricsAvailable()) {
      await auth.authenticateWithBiometrics(username);
    } else {
      login_modal.value?.showModal();
      await new Promise((resolve) =>
        login_modal.value?.addEventListener("close", resolve),
      );
      const password = login_modal.value?.returnValue;
      if (password && password.length > 0) {
        auth.authenticateWithPassword(username, login_password.value);
      }
    }
    navigateTo("/");
  } catch (e: unknown) {
    console.error(e);
    error.value = (e as Error).message;
  }
}

async function create_user(username: string, password: string) {
  try {
    await auth.registerUser(username, password);
  } catch (e) {
    console.error(e);
    error.value = (e as Error).message;
  }
}
</script>

<template>
  <div
    class="flex flex-col justify-center items-center w-9/10 md:w-full max-w-lg mx-auto gap-4"
  >
    <dialog ref="error_modal" class="modal">
      <div class="modal-box space-y-4 !px-20 max-w-lg">
        <h3 class="text-lg font-bold text-center">
          Login for user {{ login_username }} failed
        </h3>
        <h1 class="font-semibold text-error text-center" v-if="error.length">
          Error: {{ error }}
        </h1>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <dialog ref="login_modal" class="modal">
      <form
        class="modal-box space-y-4 !px-20 max-w-lg"
        @submit.prevent="login_modal?.close(login_password)"
      >
        <h3 class="text-lg font-bold text-center">
          Login for user {{ login_username }}
        </h3>
        <input
          v-model="login_password"
          type="password"
          class="input w-full"
          placeholder="Password"
          required
          minlength="2"
        />
        <div class="flex-row flex items-center justify-center w-full gap-1">
          <input
            type="button"
            class="btn btn-error grow"
            @click="login_modal?.close()"
            value="Close"
          />
          <input class="btn btn-accent grow" type="submit" value="Login" />
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <form
      class="card bg-base-100 shadow-md w-full"
      @submit.prevent="create_user(new_username, new_password)"
    >
      <div class="card-body items-center text-center">
        <h2 class="card-title">New User</h2>
        <input
          v-model="new_username"
          type="input"
          class="input validator"
          required
          placeholder="Username"
          pattern="[A-Za-z][A-Za-z0-9\-]*"
          minlength="3"
          maxlength="30"
          title="Only letters, numbers or dash"
        />
        <input
          v-model="new_password"
          type="password"
          class="input validator"
          required
          placeholder="Password"
          minlength="2"
          maxlength="10"
        />
        <button type="submit" class="btn btn-accent w-full max-w-[20rem]">
          Create
        </button>
      </div>
    </form>

    <ul class="list bg-base-100 rounded-box shadow-md w-full">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide flex w-full">
        <span class="grow"> Users </span>
        <span> (click to login) </span>
      </li>
      <li
        class="list-row cursor-pointer hover:scale-101 hover:bg-base-300 transition-all duration-100"
        v-for="user in auth.users.value"
        @click="trylogin(user.username)"
      >
        <div>
          <div class="font-semibold">{{ user.username }}</div>
          <div class="text-xs uppercase font-semibold opacity-60">
            created on
            {{ new Date(user.createdAt).toLocaleString() }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
