import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFetch } from '#app';

export const useStore = defineStore('store', {
  state: () => ({
    isAuthenticated: false,
    //showLikedPictures: ref(false),
    feedPosts: ref([]),
    likedPosts: ref([]),
    loginUsername: ref(''), // Assuming you have this state
  }),
  actions: {
    async fetchFeedPosts() {
      const { data, error } = await useFetch(`/api/feed?username=${this.loginUsername}`, {
        method: 'GET'
      });
      this.feedPosts = data.value.userPictures.concat(data.value.globalPictures) || [];
    },
    // async fetchLikedPosts() {
    //   const { data, error } = await useFetch(`/api/liked?username=${this.loginUsername}`);
    //   this.likedPosts = data.value.likedPictures || [];
    // },
  },
})