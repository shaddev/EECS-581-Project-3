<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from '#app';

const username = ref('');
const password = ref('');
const message = ref('');

const login = async () => {
  const { data } = await useFetch('/api/login', {
    method: 'POST',
    body: { username: username.value, password: password.value },
  });
  message.value = data.value?.message || 'Ayylmao error';
};
</script>