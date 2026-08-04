<script setup>
import { onMounted, reactive, ref } from 'vue'
import { postApi, productApi, systemApi } from '../api/labApi.js'

const tab = ref('products')
const products = ref([]); const posts = ref([]); const health = ref(null)
const loading = ref(false); const notice = ref('')
const productForm = reactive({ id: null, name: '', category: '장비', price: 0, stock: 0, description: '' })
const postForm = reactive({ id: null, title: '', author: '', content: '' })

async function loadAll() {
  loading.value = true; notice.value = ''
  try {
    ;[products.value, posts.value, health.value] = await Promise.all([
      productApi.getAll(), postApi.getAll(), systemApi.health(),
    ])
  } catch (error) { notice.value = error.message }
  finally { loading.value = false }
}
function clearProduct() { Object.assign(productForm, { id: null, name: '', category: '장비', price: 0, stock: 0, description: '' }) }
function clearPost() { Object.assign(postForm, { id: null, title: '', author: '', content: '' }) }
async function saveProduct() {
  try {
    productForm.id ? await productApi.update(productForm.id, productForm) : await productApi.create(productForm)
    notice.value = `상품이 ${productForm.id ? '수정' : '등록'}되었습니다.`; clearProduct(); await loadAll()
  } catch (error) { notice.value = error.message }
}
async function savePost() {
  try {
    postForm.id ? await postApi.update(postForm.id, postForm) : await postApi.create(postForm)
    notice.value = `게시글이 ${postForm.id ? '수정' : '등록'}되었습니다.`; clearPost(); await loadAll()
  } catch (error) { notice.value = error.message }
}
async function remove(kind, item) {
  if (!confirm(`“${item.name || item.title}” 항목을 삭제할까요?`)) return
  try { await (kind === 'product' ? productApi.remove(item.id) : postApi.remove(item.id)); await loadAll() }
  catch (error) { notice.value = error.message }
}
async function reset() {
  if (!confirm('상품과 게시글을 초기 상태로 되돌릴까요?')) return
  try { await systemApi.reset(); await loadAll(); notice.value = 'Mock 데이터가 초기화되었습니다.' }
  catch (error) { notice.value = error.message }
}
onMounted(loadAll)
</script>

<template>
  <section class="lab-page">
    <div class="lab-hero">
      <div><span class="eyebrow">VUE · AXIOS · NODE</span><h1>Mock API 실습실</h1><p>상품과 게시글 CRUD 요청을 한 화면에서 연습하세요.</p></div>
      <div class="server-status"><i :class="{ online: health }"></i><span>{{ health ? `API 연결 · 상품 ${health.productCount} · 게시글 ${health.postCount}` : 'API 연결 확인 필요' }}</span></div>
    </div>
    <div class="lab-toolbar">
      <div class="tabs"><button :class="{ active: tab === 'products' }" @click="tab = 'products'">상품 API</button><button :class="{ active: tab === 'posts' }" @click="tab = 'posts'">게시글 API</button></div>
      <button class="danger" @click="reset">데이터 초기화</button>
    </div>
    <p v-if="notice" class="notice">{{ notice }}</p>
    <p v-if="loading" class="empty">데이터를 불러오는 중입니다…</p>

    <div v-else-if="tab === 'products'" class="manager-grid">
      <form class="lab-card form-card" @submit.prevent="saveProduct">
        <h2>{{ productForm.id ? '상품 수정' : '상품 등록' }}</h2>
        <label>상품명<input v-model.trim="productForm.name" required /></label>
        <div class="field-row"><label>카테고리<select v-model="productForm.category"><option>장비</option><option>도서</option><option>강의</option><option>기타</option></select></label><label>재고<input v-model.number="productForm.stock" type="number" min="0" required /></label></div>
        <label>가격<input v-model.number="productForm.price" type="number" min="0" required /></label>
        <label>설명<textarea v-model.trim="productForm.description" rows="3"></textarea></label>
        <button class="primary">{{ productForm.id ? '수정 저장' : '상품 등록' }}</button><button v-if="productForm.id" type="button" class="ghost" @click="clearProduct">취소</button>
      </form>
      <div class="lab-card"><h2>상품 목록 <small>{{ products.length }}개</small></h2><div class="item-list"><article v-for="item in products" :key="item.id"><div><span class="chip">{{ item.category }}</span><h3>{{ item.name }}</h3><p>{{ item.description }}</p><strong>{{ item.price.toLocaleString() }}원 · 재고 {{ item.stock }}</strong></div><div class="actions"><button @click="Object.assign(productForm, item)">수정</button><button class="danger" @click="remove('product', item)">삭제</button></div></article></div></div>
    </div>

    <div v-else class="manager-grid">
      <form class="lab-card form-card" @submit.prevent="savePost">
        <h2>{{ postForm.id ? '게시글 수정' : '게시글 작성' }}</h2>
        <label>제목<input v-model.trim="postForm.title" required /></label><label>작성자<input v-model.trim="postForm.author" /></label><label>내용<textarea v-model.trim="postForm.content" rows="7"></textarea></label>
        <button class="primary">{{ postForm.id ? '수정 저장' : '게시글 등록' }}</button><button v-if="postForm.id" type="button" class="ghost" @click="clearPost">취소</button>
      </form>
      <div class="lab-card"><h2>게시글 목록 <small>{{ posts.length }}개</small></h2><div class="item-list"><article v-for="item in posts" :key="item.id"><div><span class="chip">#{{ item.id }} · {{ item.author }}</span><h3>{{ item.title }}</h3><p>{{ item.content }}</p></div><div class="actions"><button @click="Object.assign(postForm, item)">수정</button><button class="danger" @click="remove('post', item)">삭제</button></div></article></div></div>
    </div>
  </section>
</template>

<style scoped>
.lab-page{color:#19324d}.lab-hero{display:flex;justify-content:space-between;gap:24px;padding:30px;border-radius:22px;background:linear-gradient(135deg,#102a43,#116466);color:#fff}.eyebrow{font-size:.72rem;letter-spacing:.15em;color:#8fe3cf}.lab-hero h1{margin:7px 0}.lab-hero p{margin:0;color:#d6e5ef}.server-status{align-self:center;display:flex;gap:9px;align-items:center;padding:12px 16px;background:#ffffff17;border-radius:12px}.server-status i{width:9px;height:9px;border-radius:50%;background:#ef6b73}.server-status i.online{background:#51e5a8}.lab-toolbar{display:flex;justify-content:space-between;margin:20px 0}.tabs{display:flex;gap:8px}.tabs button,.ghost,.actions button,.danger{border:0;border-radius:9px;padding:10px 14px;cursor:pointer}.tabs button.active,.primary{background:#0d8a72;color:#fff}.danger{background:#fff0f1;color:#ba3340}.notice{padding:12px 16px;background:#eaf8f4;border-radius:10px}.manager-grid{display:grid;grid-template-columns:minmax(270px,.7fr) minmax(0,1.3fr);gap:18px}.lab-card{padding:22px;border:1px solid #dbe5ec;border-radius:16px;background:#fff;box-shadow:0 8px 24px #18334d10}.lab-card h2{margin-top:0}.lab-card small{color:#6c7d8d}.form-card label{display:grid;gap:6px;margin:13px 0;font-size:.86rem;font-weight:700}.form-card input,.form-card select,.form-card textarea{box-sizing:border-box;width:100%;padding:11px;border:1px solid #cad7e0;border-radius:8px;font:inherit}.field-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.primary{border:0;border-radius:9px;padding:12px 16px;cursor:pointer}.ghost{margin-left:8px}.item-list{display:grid;gap:10px}.item-list article{display:flex;justify-content:space-between;gap:14px;padding:16px;border:1px solid #e1e9ef;border-radius:12px}.item-list h3{margin:7px 0}.item-list p{margin:4px 0 9px;color:#607184}.chip{font-size:.74rem;color:#08735f}.actions{display:flex;gap:6px;align-items:flex-start}.empty{text-align:center;padding:40px}@media(max-width:760px){.lab-hero,.item-list article{flex-direction:column}.manager-grid{grid-template-columns:1fr}.server-status{align-self:flex-start}.lab-toolbar{gap:10px;flex-wrap:wrap}}
</style>
