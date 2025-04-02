<script setup lang="ts">
const auth = await useAuth();

const username = ref("");
const password = ref("");
</script>

<template>
  <div
    class="flex flex-col justify-center items-center w-9/10 md:w-full max-w-lg mx-auto gap-4"
  >
    <form
      class="card card-dash bg-base-100 shadow-md w-full"
      @submit.prevent="auth.registerUser(username, password)"
    >
      <div class="card-body items-center text-center">
        <h2 class="card-title">New User</h2>
        <input
          v-model="username"
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
          v-model="password"
          type="password"
          class="input validator"
          required
          placeholder="Password"
          minlength="3"
          maxlength="30"
          title="Only letters, numbers or dash"
        />
        <button type="submit" class="btn btn-primary w-full max-w-[20rem]">
          Create
        </button>
      </div>
    </form>
    <ul class="list bg-base-100 rounded-box shadow-md w-full">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide flex w-full">
        <span class="grow"> Users </span>
        <span> (click to login) </span>
      </li>
      <li class="list-row" v-for="user in auth.users.value">
        <div>
          <div class="font-semibold">{{ user.username }}</div>
          <div class="text-xs uppercase font-semibold opacity-60">
            created
            {{ new Date().getMinutes() - user.createdAt.getMinutes() }}min ago
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
