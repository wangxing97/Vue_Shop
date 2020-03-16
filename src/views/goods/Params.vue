<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">参数列表</el-breadcrumb-item>
    </breadcrumb>
    <!-- 卡片布局 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>
      <!-- 选择商品分类级联 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCascader"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="tabActiveName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-row>
            <el-col>
              <el-button type="primary" size="mini" :disabled="cateIsActive" @click="addDialogVisible = true">添加参数</el-button>
            </el-col>
          </el-row>
          <!-- 数据表格 -->
          <el-table :data="attrList">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input  class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="editAttr(scope.row)" class="el-icon-edit" size="mini">修改</el-button>
                <el-button type="danger" class="el-icon-delete" size="mini" @click="removeParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="only">
          <!-- 添加参数按钮 -->
          <el-row>
            <el-col>
              <el-button type="primary" size="mini" :disabled="cateIsActive" @click="addDialogVisible = true">添加属性</el-button>
            </el-col>
          </el-row>
          <!-- 数据表格 -->
          <el-table :data="attrList">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="editAttr(scope.row)" class="el-icon-edit" size="mini">修改</el-button>
                <el-button type="danger" class="el-icon-delete" size="mini" @click="removeParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数/属性Dialog -->
    <el-dialog :title="'添加' + dialogName" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
       <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数/属性Dialog -->
    <el-dialog :title="'修改' + dialogName" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
       <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 级联选择框选中的值数组
      selectedCascader: [],
      // 级联框数据
      cateList: [],
      // 级联绑定属性配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        expandTrigger: 'hover',
        children: 'children'
      },
      // 标签页激活的标签name
      tabActiveName: 'many',
      // 分类参数属性列表
      attrList: [],
      // 添加参数/属性Dialog是否可见
      addDialogVisible: false,
      // 添加参数Form表单数据
      addForm: {
        attr_name: ''
      },
      // Form校验
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' }
        ]
      },
      // 编辑参数/属性Dialog是否可见
      editDialogVisible: false,
      // 编辑参数Form表单数据
      editForm: {
        attr_id: '',
        attr_name: ''
      },
      // Form校验
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
    },
    // 级联选择框发生改变
    handleChange() {
      if (this.selectedCascader.length !== 3) {
        // 清空级联选择框
        this.selectedCascader = []
        // 清除已经有的数据
        this.attrList = []
        return null
      } else {
        this.getAttrList()
      }
    },
    // 标签页激活发生改变时
    handleClick() {
      if (!this.cateIsActive) {
        this.getAttrList()
      }
    },
    // 获取参数列表
    async getAttrList() {
      const { data: res } = await this.$http.get(`categories/${this.CateId}/attributes`, {
        params: { sel: this.tabActiveName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      // 将参数String转换成数组
      res.data.forEach(item => {
        // 输入标签input是否可见
        item.inputVisible = false
        // 输入框输入的值
        item.inputValue = ''
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      this.attrList = res.data
    },
    // 编辑属性
    editAttr(row) {
      this.editDialogVisible = true
      this.editForm.attr_name = row.attr_name
      this.editForm.attr_id = row.attr_id
    },
    // 点击tag标签按钮
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // input tag下点击回车、或失去焦点事件
    handleInputConfirm(row) {
      // 如果输入的值去掉空格是0说明为空，则不添加标签
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return null
      }
      // 否则就是有数据，则添加tag标签
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 保存添加tag标签操作
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.CateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('添加参数失败')
      this.$message.success('添加参数成功')
    },
    // 点击删除tag标签
    handleClose(i, row) {
      // 从i个位置开始删除一个
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 添加参数/属性Dialog关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.CateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.tabActiveName
        })
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getAttrList()
      })
    },
    // 关闭编辑Dialog
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交编辑内容
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.CateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.tabActiveName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.getAttrList()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    removeParams(row) {
      this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async valid => {
        const { data: res } = await this.$http.delete(`categories/${this.CateId}/attributes/${row.attr_id}`)
        if (res.meta.status !== 200) return this.$message.error('删除参数失败')
        this.$message.success('删除参数成功')
        this.getAttrList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  },
  computed: {
    // 获取选择分类的id
    CateId() {
      if (this.selectedCascader.length === 3) {
        return this.selectedCascader[2]
      } else {
        return null
      }
    },
    // 判断是否选择了商品分类
    cateIsActive() {
      if (this.selectedCascader.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 返回添加参数和添加属性
    dialogName() {
      if (this.tabActiveName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
    titleText() {
      if (this.tabActiveName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped="scope">
.el-alert {
  margin-bottom: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.el-tag {
  margin-right: 5px;
}
.input-new-tag {
  width: 100px;
}
</style>
