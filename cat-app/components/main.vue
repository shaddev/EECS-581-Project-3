<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header class="bg-white shadow-md">
        <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-800">Ayylmao Kitty Car App</h1>
          <nav class="flex space-x-4">
            <Button v-if="!mainstore.isAuthenticated.valueOf()" @click="showRegister = true" variant="secondary">Register</Button>
            <Button v-if="!mainstore.isAuthenticated.valueOf()" @click="showLogin = true" variant="outline">Login</Button>
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="logout" variant="destructive">Logout</Button>
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="showUpload = true" variant="default">Upload Cat Picture</Button>
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="showLikedPictures = true" variant="ghost">Liked Pictures</Button>
          </nav>
        </div>
      </header>
  
      <main class="flex-grow max-w-6xl mx-auto p-4">
        <Dialog v-model:open="showRegister">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Profile</DialogTitle>
            </DialogHeader>
            <form @submit.prevent="register" class="space-y-4">
              <Input v-model="registerUsername" placeholder="Username" class="w-full" required />
              <Input v-model="registerPassword" type="password" placeholder="Password" class="w-full" required />
              <Input v-model="registerConfirmPassword" type="password" placeholder="Confirm Password" class="w-full" required />
              <Input v-model="registerDescription" placeholder="Description (optional)" class="w-full" />
              <Input v-model="registerAddress" placeholder="Address (optional)" class="w-full" />
              <Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700">Register</Button>
            </form>
            <p v-if="registerMessage" class="text-red-600">{{ registerMessage }}</p>
          </DialogContent>
        </Dialog>
  
        <Dialog v-model:open="showLogin">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <form @submit.prevent="login" class="space-y-4">
              <Input v-model="loginUsername" placeholder="Username" class="w-full" required />
              <Input v-model="loginPassword" type="password" placeholder="Password" class="w-full" required />
              <Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700">Login</Button>
            </form>
            <p v-if="loginMessage" class="text-red-600">{{ loginMessage }}</p>
          </DialogContent>
        </Dialog>
  
        <Dialog v-model:open="showUpload">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Cat Picture</DialogTitle>
            </DialogHeader>
            <form @submit.prevent="uploadCatPicture" class="space-y-4">
              <Input v-model="uploadTitle" placeholder="Title" class="w-full" required />
              <Input type="file" @change="handleFileUpload" accept=".jpg, .jpeg, .png" class="w-full" required />
              <Textarea v-model="uploadDescription" placeholder="Description (optional)" class="w-full" />
              <Input v-model="uploadKeyword" @keyup.enter="addKeyword" placeholder="Keywords (optional)" class="w-full" />
              <div class="flex flex-wrap space-x-2">
                <span v-for="(keyword, index) in uploadKeywords" :key="index" class="bg-blue-200 px-2 py-1 rounded">
                  {{ keyword }} <Button @click="removeKeyword(index)" class="text-red-500">x</Button>
                </span>
              </div>
              <Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700">Post</Button>
            </form>
            <p v-if="uploadMessage" class="text-red-600">{{ uploadMessage }}</p>
          </DialogContent>
        </Dialog>
  
        <Dialog v-model:open="showLikedPictures">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Liked Pictures</DialogTitle>
            </DialogHeader>
            <div v-for="post in likedPosts" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
              <h2 class="text-lg font-semibold">{{ post.title }}</h2>
              <img :src="getImageUrl(post.path)" alt="Cat Picture" class="rounded" style="width: auto; height: 200px" />
              <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
              <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
              <p class="mt-1">{{ post.likes }} likes</p>
            </div>
          </DialogContent>
        </Dialog>
  
        <div v-if="mainstore.isAuthenticated.valueOf() && !showUpload && !showLikedPictures">
          <h1 class="text-2xl font-semibold mb-4">Your Feed</h1>
          <div v-for="post in mainstore.feedPosts" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
            <h2 class="text-lg font-semibold">{{ post.title }}</h2>
            <img :src="getImageUrl(post.path)" alt="Cat Picture" class="w-full h-auto rounded" />
            <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
            <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
            <p class="mt-1">{{ post.likes }} likes</p>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  /**
 * Cat Image Sharing Application Frontend
 * 
 * A Vue.js single-page application that provides user authentication,
 * image uploading, feed viewing, and image interaction capabilities.
 * 
 * Author: Team 7
 * preconditions
 *   - Vue.js 3 environment
 *   - Required components:
 *     - Button, Dialog, Input, Textarea from UI library
 *   - Backend API endpoints:
 *     - /api/register
 *     - /api/login
 *     - /api/upload
 *     - /api/feed
 *     - /api/liked
 *     - /api/like
 *   - Access to client-side cookie storage
 * 
 * postconditions
 *   - Renders responsive UI for all application features
 *   - Maintains user authentication state
 *   - Manages file uploads and image display
 *   - Handles user interactions (likes, views)
 * 
 * errors
 *   - Authentication failures
 *   - File upload errors
 *   - API connection errors
 *   - Image loading failures
 * 
 * sideEffects
 *   - Sets authentication cookies
 *   - Modifies browser history
 *   - Uploads files to server
 * 
 * invariants
 *   - Authentication state consistency
 *   - Form validation rules
 *   - Image path construction
 **/
  import { ref } from 'vue';
  import { useFetch } from '#app';

  import { useStore } from '@/stores/store'

  const mainstore = useStore()
  const isAuthenticated = mainstore.isAuthenticated.valueOf()
  console.log("isAuthenticated setup", isAuthenticated)
  // State variables
  const showRegister = ref(false);
  const showLogin = ref(false);
  const showUpload = ref(false);
  const showLikedPictures = ref(false);
  // const isAuthenticated = ref(false);
  const registerErrors = ref({});
  const loading = ref(false);

  const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/\d/.test(password)) return "Password must contain a number";
  if (!/[!@#$%^&*]/.test(password)) return "Password must contain a special character";
  return null;
};
  
  // Register logic
  const registerUsername = ref('');
  const registerPassword = ref('');
  const registerConfirmPassword = ref('');
  const registerDescription = ref('');
  const registerAddress = ref('');
  const registerMessage = ref('');
  
const register = async () => {
  registerErrors.value = {};
  loading.value = true;

  // Password validation
  const passwordError = validatePassword(registerPassword.value);
  if (passwordError) {
    registerErrors.value.password = passwordError;
    registerMessage.value = passwordError;
    loading.value = false;
    return;
  }

  // Confirm password check
  if (registerPassword.value !== registerConfirmPassword.value) {
    registerErrors.value.confirmPassword = "Passwords do not match";
    registerMessage.value = "Passwords do not match";
    loading.value = false;
    return;
  }

  try {
    const { data } = await useFetch('/api/register', {
      method: 'POST',
      body: {
        username: registerUsername.value,
        password: registerPassword.value,
        description: registerDescription.value,
        address: registerAddress.value,
      },
    });

    if (data.value?.success) {
      showRegister.value = false;
      resetRegisterForm();
    } else {
      registerMessage.value = data.value?.message || 'Registration failed';
    }
  } catch (error) {
    registerMessage.value = 'An error occurred during registration';
  } finally {
    loading.value = false;
  }
};

const resetRegisterForm = () => {
  registerUsername.value = '';
  registerPassword.value = '';
  registerConfirmPassword.value = '';
  registerDescription.value = '';
  registerAddress.value = '';
  registerMessage.value = '';
  registerErrors.value = {};
};
  
  // Login logic
  const loginUsername = ref('');
  const loginPassword = ref('');
  const loginMessage = ref('');
  
  const login = async () => {
    const { data } = await useFetch('/api/login', {
      method: 'POST',
      body: { username: loginUsername.value, password: loginPassword.value },
    });
  
    if (data.value?.success) {
      if (process.client) {
        document.cookie = "auth=true; max-age=3600"; // Set cookie for 1 hour
      }
      mainstore.isAuthenticated = true;
      mainstore.loginUsername = loginUsername.value;
      console.log("isAuthenticated login", mainstore.isAuthenticated.valueOf())
      showLogin.value = false;
    } else {
      loginMessage.value = data.value?.message || 'Login failed';
    }
  };
  
  // Logout logic
  const logout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      document.cookie = "auth=; max-age=0"; // Remove cookie
      mainstore.isAuthenticated = false;
    }
  };
  
  // Upload Cat Picture logic
  const uploadTitle = ref('');
  const uploadFile = ref(null);
  const uploadDescription = ref('');
  const uploadKeyword = ref('');
  const uploadKeywords = ref([]);
  const uploadMessage = ref('');
  
  const handleFileUpload = (event) => {
    uploadFile.value = event.target.files[0];
  };
  
  const addKeyword = () => {
    if (uploadKeyword.value) {
      uploadKeywords.value.push(uploadKeyword.value);
      uploadKeyword.value = '';
    }
  };
  
  const removeKeyword = (index) => {
    uploadKeywords.value.splice(index, 1);
  };
  
  const uploadCatPicture = async () => {
    if (!uploadFile.value) {
      uploadMessage.value = 'Please select an image to upload';
      return;
    }
  
    const formData = new FormData();
    formData.append('title', uploadTitle.value);
    formData.append('image', uploadFile.value);
    formData.append('description', uploadDescription.value);
    formData.append('keywords', uploadKeywords.value.join(','));
    formData.append('userId', mainstore.loginUsername);
  
    const { data, error } = await useFetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  
    uploadMessage.value = data.value?.message || 'Upload error';
    if (data.value?.success) {
      showUpload.value = false;
      mainstore.fetchFeedPosts();
    }
  };
  
  // Feed and Liked Pictures logic
  const feedPosts = mainstore.feedPosts;
  const likedPosts = ref([]);
  
  const toggleLike = async (post) => {
    console.log(post.liked)
    const { data, error } = await useFetch(`/api/like`, {
      method: 'POST',
      body: {
        username: mainstore.loginUsername.valueOf(),
        imageId: post.id,
        isLiking: !post.liked
      }
    });
  
    if (data.value?.success) {
      post.liked = !post.liked;
      post.likes = post.liked ? post.likes + 1 : post.likes - 1;
      if (showLikedPictures.value) {
        likedPosts.value = likedPosts.value.filter(p => p.id !== post.id);
      }
    }
  };
  


  console.log(mainstore.feedPosts)

  const getImageUrl = (path) => {
  if (process.client) {
    return `${window.location.origin}/uploads/${path}`;
  }
  return ''; 
};

const fetchLikedPosts = async () => {
    const { data, error } = await useFetch(`/api/liked?username=${loginUsername.value}`);
    likedPosts.value = data.value.likedPictures || [];
  };
  
  // Initial fetch
  watch(() => mainstore.isAuthenticated, async (newVal, oldVal) => {
    if (newVal) {
      await mainstore.fetchFeedPosts()
    }
    console.log("IsAuthenticated watch", mainstore.isAuthenticated)
  })

  watch(showLikedPictures, async (newVal, oldVal) => {
    if (newVal) {
      await fetchLikedPosts()
    }
    console.log("likes watch", newVal)
  })
  </script>

