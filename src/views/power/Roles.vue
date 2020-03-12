<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">权限管理</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">角色列表</el-breadcrumb-item>
    </breadcrumb>
    <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb> -->
    <!-- 角色列表card -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList">
        <el-table-column type="expand">
          <!-- 权限列表 -->
          <template slot-scope="scope">
            <el-row>
              <el-col :class="['levelCenter', 'bottomBorder', i1 === 0 ? 'topBorder' : '']"  v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 一级权限 -->
                <el-col :span="6">
                  <el-tag closable type="primary">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级、三级权限 -->
                <el-col :span="18">
                  <el-row :class="['levelCenter', i2 === 0 ? '' : 'topBorder']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <!-- 二级权限列表 -->
                    <el-col :span="6">
                      <el-tag closable type="success">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限列表 -->
                    <el-col :span="18">
                      <el-tag @close="removePower(scope.row,item3.id)" closable type="warning" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button @click="showRoleForm(scope.row.id)" size="mini" icon="el-icon-edit" type="primary">编辑</el-button>
            <el-button @click="removeRole(scope.row.id)" size="mini" icon="el-icon-delete" type="danger">删除</el-button>
            <el-button size="mini" @click="showRightsDialog(scope.row)" icon="el-icon-setting" type="warning">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色Dialog -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      @close="addClearClosed">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="70">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoleForm.roleName" placeholder="请输入角色名"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色Dialog -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      @close="editClearClosed">
      <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="70">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoleForm.roleName" placeholder="请输入角色名"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加权限Dialog -->
    <el-dialog
      title="添加权限"
      @close="clearDefKeys"
      :visible.sync="addRightsDialogVisible">
      <!-- 树形权限 -->
      <el-tree :data="rightsList" :props="rightsListProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRightsDialogVisible = false">取 消</el-button>
        <el-button @click="alotRights" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入自定义组件
import BreadCrumb from '../components/breadcrumb.vue'
export default {
  components: {
    breadcrumb: BreadCrumb
  },
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 添加角色Dialog可见标示
      addDialogVisible: false,
      // 添加角色Form表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色校验规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 编辑角色Dialog可见标示
      editDialogVisible: false,
      // 编辑角色Form表单数据
      editRoleForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 添加权限Dialog可见标示
      addRightsDialogVisible: false,
      // 权限列表
      rightsList: [],
      // 子节点属性和属性名
      rightsListProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id数组
      defKeys: [],
      // 点击分配权限存储角色Id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
    },
    // 关闭添加Dialog时清空校验规则以及数据
    addClearClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRoles() {
      // 提交前校验表单
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 成功需要三步
        // 关闭Dialog
        this.addDialogVisible = false
        // 提示添加成功
        this.$message.success(res.meta.msg)
        // 刷新列表
        this.getRolesList()
      })
    },
    // 关闭编辑Dialog时清空校验规则以及数据
    editClearClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 点击编辑传来id,查出数据显示编辑Dialog
    async showRoleForm(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editRoleForm = res.data
      this.editDialogVisible = true
    },
    // 提交编辑表单
    editRoles() {
      // 提交前数据校验
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 编辑成功还是三步
        // 关闭编辑Dialog
        this.editDialogVisible = false
        // 提示更新成功
        this.$message.success('更新成功')
        // 刷新列表
        this.getRolesList()
      })
    },
    // 删除角色
    removeRole(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success(res.meta.msg)
        this.getRolesList()
      }).catch(() => {
        return this.$message.info('已取消删除')
      })
    },
    // 删除角色权限
    async removePower(row, rightId) {
      this.$confirm('此操作将删除该角色的权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        row.children = res.data
        this.$message.success('删除权限成功')
      }).catch(() => {
        return this.$message.info('已取消删除')
      })
    },
    // 显示已有权限的Dialog
    async showRightsDialog(node) {
      this.roleId = node.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightsList = res.data
      this.addRightsDialogVisible = true
      this.getDefKeys(node, this.defKeys)
    },
    // 通过递归的形式保存用户下所有的三级权限id
    // 并且保存在defKeys数组中
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        return this.getDefKeys(item, arr)
      })
    },
    // 关闭Dialog清空DefKeys
    clearDefKeys() {
      this.defKeys = []
    },
    // 点击确定分配权限
    async alotRights() {
      // 获取全选id
      const checkKeys = this.$refs.treeRef.getCheckedKeys()
      // 获取半选id
      const checkHalfKeys = this.$refs.treeRef.getHalfCheckedKeys()
      // 拼接成一个数组,...是展开运算符,直接将结果以,分割将结果直接赋值
      const keys = [...checkKeys, ...checkHalfKeys]
      // 将数组以,分割拼成字符串
      const str = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: str
      })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.addRightsDialogVisible = false
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin:8px;
}
.topBorder {
  border-top: 1px solid #eee;
}
.bottomBorder {
  border-bottom: 1px solid #eee;
}
.levelCenter {
  display: flex;
  align-items: center;
}
</style>
