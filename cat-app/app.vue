<template>
  <div>
    <!-- <header>
      <nav>
        <router-link v-if="!isAuthenticated" to="/">Home</router-link>
        <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
        <router-link v-if="!isAuthenticated" to="/register">Register</router-link>
        <button v-if="isAuthenticated" @click="logout">Logout</button>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main> -->
    <Main />
  </div>
</template>


<!-- <script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isAuthenticated = ref(false);
const router = useRouter();

onMounted(() => {
  if (process.client) {
    isAuthenticated.value = localStorage.getItem('auth') === 'true';
    if (localStorage.getItem('needRefresh') === 'true') {
      window.location.reload();
      localStorage.removeItem('needRefresh');
    }
  }
});

const logout = async () => {
  await $fetch('/api/logout');
  isAuthenticated.value = false;
  if (process.client) {
    localStorage.removeItem('auth');
  }
  router.push('/');
};
</script> -->