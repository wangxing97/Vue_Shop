<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message({
        message: '退出成功',
        showClose: true,
        center: true,
        duration: 1000
      })
    }
  }
}
</script>

<style lang="less" scoped></style>
