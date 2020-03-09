<template>
  <div class="login_container">
    <div class="login_box">
      <!-- logo -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="logo" />
      </div>
      <!-- 登录表单区域 -->
      <!-- label-width：给左侧留出的空间,:model是单向绑定从Vue实例中取值，v-model是双向绑定 -->
      <!-- :rules绑定校验 ref：拿到实例的引用对象 -->
      <el-form
        ref="loginFormRef"
        class="login_form"
        :model="loginForm"
        :rules="rules"
      >
        <!-- 用户名,校验需要给form-item的prop属性设置为需要校验的字段名-->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 初始化Form表单所要绑定的属性
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '用户名长度在5-10之间', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '密码长度在3-10之间', trigger: 'blur' }
        ]
      }
    }
  }, // data end
  methods: {
    submitForm() {
      // 通过this里的$refs中获取form定义的实例，然后调用方法，validate会返回一个boolean来输出是否校验成功
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          const result = await this.$http.post('login', this.loginForm)
          // 可以通过ES6中的对象解构来获取result里的值,data直接对应result里的data，res是data的引用对象
          const { data: res } = result
          if (res.meta.status === 200) {
            this.loginSuccess()
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          } else {
            this.loginError()
          }
        } else {
          return false
        }
      })
    },
    // 点击重置按钮，重置表单
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    },
    loginSuccess() {
      this.$message({
        // 设置弹出框可以手动关闭
        showClose: true,
        message: '登录成功',
        type: 'success',
        // 字体在弹出框居中
        center: true,
        duration: 1000
      })
    },
    loginError() {
      this.$message({
        showClose: true,
        message: '登录失败，请重试',
        type: 'error',
        center: true,
        duration: 1000
      })
      // 1、将登录成功之后的token，保存到客户端的sessionStorage中
      //   1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
      //   1.2 token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
      // 2、通过编程式导航跳转到后台主页，路由地址是 /home
    }
  }
}
</script>

<!-- scoped控制生效区间，只在当前组件生效，取消则全局生效 -->
<style lang="less" scoped>
//需要安装less和less-loader依赖，在开发环境中
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
//transform会根据盒子的宽高进行偏移，left和top根据父容器宽高偏移
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  transform: translate(-50%, -50%);
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 5px;
}
//设置顶部logo
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
//设置form,默认盒子的宽是width+padding+border，会将盒子本身撑大，设置成border-box后，宽度不会随着padding等变换
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
//让按钮组在右下角
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
