<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 栅格布局 默认24格 通过:span设置,栅格之间的间隙通过:gutter -->
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addFormVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表数据表格 -->
      <el-table :data="userList" border stripe >
        <el-table-column type="index" label="#" width="80"></el-table-column>
        <el-table-column label="姓名" prop="username" width="120"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" width="110">
          <template slot-scope="scope">
            <!-- 状态开关 -->
            <el-switch v-model="scope.row.mg_state" @change="stateChange(scope.row)" active-color="#13ce66" inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配权限 -->
            <el-tooltip content="分配权限" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加表单对话框 -->
    <el-dialog
      title="用户添加"
      :visible.sync="addFormVisible"
      @close="addClearForm"
      >
      <!-- 添加表单Form -->
      <el-form :model="addUserForm" label-width="70px" :rules="addUserFormRules" ref="addUserFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
          <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
          <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
          <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile" placeholder="请输入电话"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑表单对话框 -->
    <el-dialog
      title="用户编辑"
      :visible.sync="editFormVisible"
      @close="editClearForm"
      >
      <!-- 编辑表单Form -->
      <el-form :model="editUserForm" label-width="70px" :rules="editUserFormRules" ref="editUserFormRef">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editUserForm.mobile" placeholder="请输入电话"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义邮箱验证规则,rule是规则，value是校验的值，callback是回调函数
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!regEmail.test(value)) return callback(new Error('邮箱格式不正确'))
      callback()
    }
    // 自定义电话验证规则
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (!regMobile.test(value)) return callback(new Error('电话格式不正确'))
      callback()
    }
    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示的数据条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 添加表单可见性
      addFormVisible: false,
      // 添加表单的Form数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的校验规则
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度为3~10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名长度为6~15个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑表单的Form数据
      editUserForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 编辑表单的校验规则
      editUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑表单的可见性
      editFormVisible: false
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 每页条数大小发生变化时
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 当页数发生变化时
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getUserList()
    },
    // 状态发生变化处理函数
    async stateChange(row) {
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },
    // 对话框关闭时清空Form表单里的校验数据
    addClearForm() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getUserList()
        this.addFormVisible = false
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editFormVisible = true
      this.editUserForm = res.data
    },
    // 清空编辑表单里的校验数据
    editClearForm() {
      this.$refs.editUserFormRef.resetFields()
    },
    // 提交编辑表单的数据
    editUser() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editUserForm.id, { email: this.editUserForm.email, mobile: this.editUserForm.mobile })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 关闭编辑表单
        this.editFormVisible = false
        // 提示用户更新成功
        this.$message.success('更新成功')
        // 刷新列表
        this.getUserList()
      })
    },
    // 根据id删除用户
    removeUserById(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getUserList()
      }).catch(() => {
        return this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
