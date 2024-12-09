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
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="fetchMatches" variant="ghost">Generate Matches</Button>
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="showChat = true" variant="ghost">Chat</Button>
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="showSearchUsers = true" variant="ghost">Search User</Button>
            <Button v-if="mainstore.isAuthenticated.valueOf()" @click="openMyProfile" variant="ghost">My Profile</Button>
          </nav>
        </div>
      </header>

            <form v-if="mainstore.isAuthenticated.valueOf()"  @submit.prevent="searchCatPicture" class="space-y-4">
              <Textarea v-model="searchKeyword" placeholder="Keywords" class="w-full" />
              <Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700">Search</Button>
            </form>



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
              <Textarea v-model="uploadKeyword" placeholder="Keywords (optional)" class="w-full" />
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
              <Button @click="toggleShowProfile(post.username)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.username }}</Button>
              <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
              <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button>
              <p class="mt-1">{{ post.likes }} likes</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showMatches">
          <DialogContent class="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Matches</DialogTitle>
            </DialogHeader>
            <div v-if="matches.length === 0" class="text-gray-600">No matches found.</div>
            <div v-else>
              <p class="text-gray-600">
                You have matched with {{ new Set(matches.map(match => match.matchUsername)).size }} 
                {{ new Set(matches.map(match => match.matchUsername)).size === 1 ? 'user' : 'users' }}:
              </p>
              <p v-for="match in [...new Set(matches.map(match => match.matchUsername))]" :key="match" class="text-gray-600">
                Username: {{ match }}
              </p>
              <p>Matched Images:</p>
              <div v-for="match in matches" :key="match.matchUsername + match.matchTitle" class="mb-4 p-4 bg-white rounded shadow">
                <h2 class="text-lg font-semibold">{{ match.matchTitle }}</h2>
                <img :src="getImageUrl(match.matchPath)" alt="Cat Picture" class="w-full h-auto rounded" />
                <p v-if="match.matchDescription" class="mt-2 text-gray-600">{{ match.matchDescription }}</p>
                <p class="mt-1 text-gray-600">Liked by: {{ match.matchUsername }}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showSearchUsers">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search User</DialogTitle>
              <DialogClose></DialogClose>
            </DialogHeader>
            <Textarea v-model="searchedUser" class="w-full" />
            <Button @click="searchUsers()" class="mt-2 text-blue-600 hover:bg-blue-100">Search</Button>
            <div v-for="user in searchedUsers" :key="user.id" class="mb-4 p-4 bg-white rounded shadow">
              <Button @click="toggleShowProfile(user.username)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ user.username }}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showProfile">
          <DialogContent class="overflow-auto h-3/4">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogClose></DialogClose>
            </DialogHeader>
            <h2 class="text-lg font-semibold">{{ currentProfile.username }}</h2>
            <h2 class="text-lg font-semibold">{{ "Address: " + currentProfile.address }}</h2>
            <h2 class="text-lg font-semibold">{{ "Description: " + currentProfile.description }}</h2>
            <div v-for="post in profileImages" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
              <h2 class="text-lg font-semibold">{{ post.title }}</h2>
              <img :src="getImageUrl(post.path)" alt="Cat Picture" class="rounded" style="width: auto; height: 200px" />
              <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
              <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
              <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button>
              <p class="mt-1">{{ post.likes }} likes</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showMyProfile">
          <DialogContent class="overflow-auto h-3/4">
            <DialogHeader>
              <DialogTitle>My Profile</DialogTitle>
              <DialogClose></DialogClose>
            </DialogHeader>
            <form @submit.prevent="editProfile" class="space-y-4">
              <h2 class="text-lg font-semibold">Address</h2>
              <Input v-model="editAddress" class="w-full" />
              <h2 class="text-lg font-semibold">Description</h2>
              <Input v-model="editDescription" class="w-full" />
              <Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700">Edit Profile</Button>
            </form>
            <div v-for="post in profileImages" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
              <h2 class="text-lg font-semibold">{{ post.title }}</h2>
              <img :src="getImageUrl(post.path)" alt="Cat Picture" class="rounded" style="width: auto; height: 200px" />
              <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
              <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
              <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button>
              <Button @click="deletePost(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Delete</Button>
              <p class="mt-1">{{ post.likes }} likes</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showLikedUsers">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Liked Users</DialogTitle>
              <DialogClose></DialogClose>
            </DialogHeader>
            <div v-for="user in likedUsers" :key="user.id" class="mb-4 p-4 bg-white rounded shadow">
              <h2 class="text-lg font-semibold">{{ user.username }}</h2>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showChat">
          <DialogContent class="max-h-[55rem] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chat</DialogTitle>
              <DialogClose></DialogClose>
            </DialogHeader>
            <Textarea v-model="chatUser" class="w-full" />
            <Button @click="connectChat()" class="mt-2 text-blue-600 hover:bg-blue-100">Connect</Button>
            <Textarea v-model="currentMessage" class="w-full" />
            <Button @click="sendMessage()" class="mt-2 text-blue-600 hover:bg-blue-100">Send</Button>
            <div v-for="chatMessage in currentChat" :key="chatMessage.id" class="mb-4 p-4 bg-white rounded shadow">
              <h2 class="text-lg font-semibold">{{ chatMessage.username + ": " + chatMessage.message }}</h2>
              <h2 v-if="chatMessage.message.match(/https?:\/\/[^\s]+/g)" class="text-lg font-semibold">
                <div v-for="post in mainstore.feedPosts" :key="post.id">
                  <div v-if="chatMessage.message.match(/#(\d+)/)?.[1] == post.id">
                    <br>
                    <h1>Embedded Post:</h1>                        
                    <h2 class="text-lg font-semibold">{{ post.title }}</h2>
                        <img :src="getImageUrl(post.path)" alt="Cat Picture" class="w-full h-auto rounded" />
                        <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
                        <!-- <Button @click="toggleShowProfile(post.username)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.username }}</Button> -->
                        <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
                        <!-- <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button> -->
                        <p class="mt-1">{{ post.likes }} likes</p>
                        <p class="mt-2 text-blue-600">
                          <a :href="getPostLink(post.id)">Post Reference Link</a>
                        </p>
                  </div>
                </div>
              </h2>
            </div>
          </DialogContent>
        </Dialog>
        <div v-if="mainstore.isAuthenticated.valueOf() && !showUpload && !showLikedPictures">
          <Tabs default-value="mainfeed" class="w-[400px]">
            <TabsList>
              <TabsTrigger value="mainfeed">
                Main
              </TabsTrigger>
              <TabsTrigger value="personalfeed">
                Personal
              </TabsTrigger>
              <TabsTrigger value="nearbyfeed" >
                Nearby
              </TabsTrigger>
            </TabsList>
              <TabsContent value="mainfeed">
                    <h1 class="text-2xl font-semibold mb-4">All Feed</h1>
                    <div v-for="post in mainstore.feedPosts" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
                      <section :id="post.id">
                        <h2 class="text-lg font-semibold">{{ post.title }}</h2>
                        <img :src="getImageUrl(post.path)" alt="Cat Picture" class="w-full h-auto rounded" />
                        <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
                        <Button @click="toggleShowProfile(post.username)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.username }}</Button>
                        <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
                        <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button>
                        <p class="mt-1">{{ post.likes }} likes</p>
                        <p class="mt-2 text-blue-600">
                          <a :href="getPostLink(post.id)">Post Reference Link</a>
                        </p>
                      </section>
                    </div>
              </TabsContent>
              <TabsContent value="personalfeed">
                <h1 class="text-2xl font-semibold mb-4">Personal Feed</h1>
                <div v-for="post in mainstore.feedPosts.filter(post => post.liked === 1)" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
                  <h2 class="text-lg font-semibold">{{ post.title }}</h2>
                  <img :src="getImageUrl(post.path)" alt="Cat Picture" class="w-full h-auto rounded" />
                  <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
                  <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
                  <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button>
                  <p class="mt-1">{{ post.likes }} likes</p>
                </div>
              </TabsContent>
              <TabsContent value="nearbyfeed">
                    <h1 class="text-2xl font-semibold mb-4">Nearby Feed</h1>
                    <div v-for="post in nearbyPosts" :key="post.id" class="mb-4 p-4 bg-white rounded shadow">
                      <h2 class="text-lg font-semibold">{{ post.title }}</h2>
                      <img :src="getImageUrl(post.path)" alt="Cat Picture" class="w-full h-auto rounded" />
                      <p v-if="post.description" class="mt-2 text-gray-600">{{ post.description }}</p>
                      <Button @click="toggleShowProfile(post.username)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.username }}</Button>
                      <Button @click="toggleLike(post)" class="mt-2 text-blue-600 hover:bg-blue-100">{{ post.liked ? 'Unlike' : 'Like' }}</Button>
                      <Button @click="toggleShowLikedUsers(post)" class="mt-2 text-blue-600 hover:bg-blue-100">Liked Users</Button>
                      <p class="mt-1">{{ post.likes }} likes</p>
                    </div>
              </TabsContent>
            </Tabs>
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
  // Getting the main store instance
  const mainstore = useStore()
  const isAuthenticated = mainstore.isAuthenticated.valueOf()
  console.log("isAuthenticated setup", isAuthenticated)
  // State variables
  const showRegister = ref(false);
  const showLogin = ref(false);
  const showUpload = ref(false);
  const showLikedPictures = ref(false);
  const showLikedUsers = ref(false);
  const likedUsers = ref([]);

  // profile refs
  const showProfile = ref(false);
  const currentProfile = ref(null);
  const profileImages = ref([]);
  // const isAuthenticated = ref(false);

  // search user refs
  const showSearchUsers = ref(false);
  const searchedUsers = ref([]);
  const searchedUser = ref('');

  // my profile refs
  const showMyProfile = ref(false);
  const editAddress = ref('');
  const editDescription = ref('');

  const registerErrors = ref({});
  const loading = ref(false);

  //chat refs
  const showChat = ref(false)
  const currentChat = ref([])
  const currentMessage = ref('')
  const chatUser = ref('') // the other user

  //matches refs
  const showMatches = ref(false)

  // nearby feed refs
  const nearbyPosts = ref([]); 

  // This is the password validation function
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
// Register function is to handle user registration
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

// Resets registration form fields
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
  const curInterval = ref(null)
  
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
  
  // Search Cat Picture logic
  const searchKeyword = ref('');
  
  const handleFileUpload = (event) => {
    uploadFile.value = event.target.files[0];
  };
  
  // Adding a keyword to the list for image metadata
  const addKeyword = () => {
    if (uploadKeyword.value) {
      uploadKeywords.value.push(uploadKeyword.value);
      uploadKeyword.value = '';
    }
  };
  // To remove a keyword from the list
  const removeKeyword = (index) => {
    uploadKeywords.value.splice(index, 1);
  };
  
  // This is the function to upload cat pitcure to send image data to server 
  const uploadCatPicture = async () => {
    if (!uploadFile.value) {
      uploadMessage.value = 'Please select an image to upload';
      return;
    }
    const formData = new FormData();
    formData.append('title', uploadTitle.value);
    formData.append('image', uploadFile.value);
    formData.append('description', uploadDescription.value);
    formData.append('keywords', uploadKeyword.value);
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

  const searchCatPicture = async () => {
  const searchKeywordValue = searchKeyword.value;
  console.log(searchKeywordValue);

  const { data, error } = await useFetch(`/api/search?keyword=${encodeURIComponent(searchKeywordValue)}`, {
    method: 'GET',
  });

  if (data.value?.success) {
    if (data.value.images.length > 0) {
      mainstore.feedPosts = data.value.images;
    } else {
      alert('No images matched the search query.');
      await mainstore.fetchFeedPosts();
    }
  }
};

const getPostLink = (postId) => {
  return `${window.location.href.split('#')[0]}#${postId}`;
};


  const sendMessage = async () => {
    const { data } = await useFetch('/api/sendmessage', {
      method: 'POST',
      body: { sourceUsername: loginUsername.value, receivingUsername: chatUser.value, message: currentMessage.value },
    });
    currentMessage.value = '';
  }

  const connectChat = async () => {
    const sourceUsername = loginUsername.value;
    const receivingUsername = chatUser.value;

    console.log('source is', sourceUsername, 'receiver is', receivingUsername);
  
    const { data, error } = await useFetch(`/api/getmessages?sourceUsername=${sourceUsername}&receivingUsername=${receivingUsername}`);
  
    if (data.value?.success) {

      currentChat.value = data.value;
      
      if (clearInterval.value !== null){
        clearInterval(curInterval);
      }
      curInterval.value = setInterval(async () => {
        const { data, error } = await useFetch(`/api/getmessages?sourceUsername=${sourceUsername}&receivingUsername=${receivingUsername}`);
        currentChat.value = data.value?.messages;
      }, 5000);
    }
  }

  
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

  const toggleShowLikedUsers = async (post) => {
    const { data, error } = await useFetch(`/api/likedusers?postId=${post.id}`);
    likedUsers.value = data.value.likedUsers;
    showLikedUsers.value = true;
  }

  const toggleShowProfile = async (username) => {
    const { data, error } = await useFetch(`/api/profile?username=${username}`);
    showProfile.value = true;
    currentProfile.value = data.value.profile;
    profileImages.value = data.value.userImages;
  }

  const openMyProfile = async () => {
    const { data, error } = await useFetch(`/api/profile?username=${loginUsername.value}`);
    showMyProfile.value = true;
    currentProfile.value = data.value.profile;
    profileImages.value = data.value.userImages;
    editAddress.value = currentProfile.value.address;
    editDescription.value = currentProfile.value.description;
  }

  const searchUsers = async () => {
    const { data, error } = await useFetch(`/api/searchusers?username=${searchedUser.value}`);
    searchedUsers.value = data.value.users;
  }

  const editProfile = async () => {
    const { error } = await useFetch('/api/editprofile', {
      method: 'POST',
      body: {
        username: loginUsername.value,
        description: editDescription.value,
        address: editAddress.value,
      },
    });
  }

  const deletePost = async (post) => {
    const { error } = await useFetch(`/api/deletepost`, {
      method: 'DELETE',
      body: {
        id: post.id
      }
    });
  }

  console.log(mainstore.feedPosts)

  const getImageUrl = (path) => {
  if (process.client) {
    return `${window.location.origin}/uploads/${path}`;
  }
  return ''; 
};

// Matches logic
const matches = ref([]);

const fetchMatches = async () => {
  const { data, error } = await useFetch(`/api/getmatches?username=${loginUsername.value}`);
  if (data.value?.success) {
    matches.value = data.value.matches;
  } else {
    matches.value = [];
  }
  showMatches.value = true;
};

// Fetch like dposts for the logged in user
const fetchLikedPosts = async () => {
    const { data, error } = await useFetch(`/api/liked?username=${loginUsername.value}`);
    likedPosts.value = data.value.likedPictures || [];
};

const fetchNearbyPosts = async () => {
  const { data, error } = await useFetch(`/api/nearby?username=${loginUsername.value}`);
  nearbyPosts.value = data.value.nearbyPosts || [];
}
  
// Initial fetch
watch(() => mainstore.isAuthenticated, async (newVal, oldVal) => {
  if (newVal) {
    await mainstore.fetchFeedPosts();
    await fetchNearbyPosts();
  }
  console.log("IsAuthenticated watch", mainstore.isAuthenticated)
})
// watcher to load liked posts when showing liked pictures is toggled 
watch(showLikedPictures, async (newVal, oldVal) => {
  if (newVal) {
    await fetchLikedPosts()
  }
  console.log("likes watch", newVal)
})

</script>

