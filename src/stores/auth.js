import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../api/labApi.js'
import { accessTokenKey } from '../api/http.js'

const userKey = 'jwt-lab-user'
const storedUser = () => {
  try { return JSON.parse(sessionStorage.getItem(userKey)) } catch { return null }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(sessionStorage.getItem(accessTokenKey))
  const user = ref(storedUser())
  const isLoading = ref(false)
  const errorMessage = ref('')
  const protectedMessage = ref(null)
  const isLoggedIn = computed(() => Boolean(accessToken.value && user.value))

  function save(result) {
    accessToken.value = result.accessToken
    user.value = result.user
    sessionStorage.setItem(accessTokenKey, result.accessToken)
    sessionStorage.setItem(userKey, JSON.stringify(result.user))
  }
  function logout() {
    accessToken.value = null; user.value = null; protectedMessage.value = null
    sessionStorage.removeItem(accessTokenKey); sessionStorage.removeItem(userKey)
  }
  async function login(email, password) {
    isLoading.value = true; errorMessage.value = ''
    try { save(await authApi.login({ email, password })); return true }
    catch (error) { logout(); errorMessage.value = error.message; return false }
    finally { isLoading.value = false }
  }
  async function verify() {
    try { user.value = await authApi.me(); return true }
    catch { logout(); return false }
  }
  async function fetchProtectedMessage() {
    isLoading.value = true; errorMessage.value = ''
    try { protectedMessage.value = await authApi.protectedMessage() }
    catch (error) { errorMessage.value = error.message }
    finally { isLoading.value = false }
  }
  return { accessToken, user, isLoading, errorMessage, protectedMessage, isLoggedIn, login, logout, verify, fetchProtectedMessage }
})
