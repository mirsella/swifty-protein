<script setup lang="ts">
const user = useAuth().user;
watchEffect(() => {
  if (!user.value) {
    navigateTo("/users");
  }
});
</script>
<template>
  <div class="flex flex-col min-h-screen">
    <div class="mb-4 gap-8 bg-base-100 navbar shadow-sm pt-[env(safe-area-inset-top)]">
      <div class="flex-1 mx-4 font-semibold text-xl">swifty protein</div>
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
