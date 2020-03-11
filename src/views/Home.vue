<template>
  <!-- 页面容器 -->
  <el-container>
    <!-- 顶部导航 -->
    <el-header>
      <div>
        <img src="../assets/img/heima.png" alt="zc" />
        <span>基于Vue的电商项目实战</span>
      </div>
      <el-button type="info" class="logoutBtn" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体容器 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏缩放按钮 -->
        <div class="toggleBtn" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#2f3441"
          text-color="#fff"
          active-text-color="#409BFF"
          :unique-opened="true"
          :collapse-transition="false"
          :collapse="isCollapse"
          :router="true"
          :default-active="activePath"
        >
          <!-- 用户管理一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + secondItem.path"
            v-for="secondItem in item.children" :key="secondItem.id"
            @click="saveActivePath">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ secondItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      // 定义菜单图标，根据菜单的id取值
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-3702mima',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 定义当前菜单激活哪一个
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.saveActivePath()
  },
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
    },
    // 获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 设置当前激活菜单页
    saveActivePath() {
      this.activePath = this.$router.history.current.path
    }
  }
}
</script>

<style lang="less" scoped>
// el-container 就代表class为el-container
.el-container {
  height: 100%;
}
.el-header {
  background-color: #333a3d;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
  }
}
.el-header span {
  margin-left: 15px;
  color: #fff;
  font-size: 20px;
}
.el-aside {
  padding-top: 10px;
  background-color: #2f3441;
  .el-menu {
    border-right: none;
    span {
      margin-left: 10px;
    }
  }
}
.el-main {
  background-color: #e8edf0;
}
.toggleBtn {
  background-color: #4A5064;
  color: #fff;
  font-size: 10px;
  line-height: 26px;
  text-align: center;
  letter-spacing: 6px;
  cursor: pointer;
}
</style>
