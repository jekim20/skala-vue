<script setup>
const handleBtn01 = () => {
  alert('btn01 클릭되었습니다!')
}

const handleBtn02 = () => {
  alert('btn02 클릭되었습니다!')
}

const handleLink = () => {
  alert('네이버 링크를 클릭했습니다!')
}
</script>

<template>
  <div @click="alert('부모 영역 클릭!')">
    <p>부모 영역 (클릭 시 alert 발동)</p>

    <button @click="handleBtn01">버블링 발생 버튼</button>

    <button @click.stop="handleBtn02">버블링 차단 버튼</button>

    <a href="https://www.naver.com" @click.prevent.stop="handleLink"> 네이버 링크2 </a>
  </div>
</template>
