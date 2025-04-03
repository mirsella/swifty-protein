<script setup lang="ts">
const user = useAuth().user;
watchEffect(() => {
  if (!user.value) {
    navigateTo("/users");
  }
});
</script>
<template>
  <div class="bg-base-200 min-h-screen">
    <div
      class="mb-4 bg-base-100 navbar shadow-sm pt-[env(safe-area-inset-top)]"
    >
      <div class="flex-1">swifty protein</div>
      <div v-if="user">
        <div class="mx-2 badge">{{ user?.username }}</div>
        <button class="mx-2 btn btn-error" @click="useAuth().logout()">
          Logout
        </button>
      </div>
    </div>
    <NuxtPage />
  </div>
</template>
