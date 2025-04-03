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
    <div class="mb-4 bg-base-100 navbar shadow-sm">
      <div class="flex-1">swifty protein</div>
      <div class="mx-4 badge" v-if="user">{{ user?.username }}</div>
      <button class="mx-4 btn btn-error" @click="useAuth().logout()">
        Logout
      </button>
    </div>
    <NuxtPage />
  </div>
</template>
