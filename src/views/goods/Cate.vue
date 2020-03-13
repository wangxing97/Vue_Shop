<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">商品分类</el-breadcrumb-item>
    </breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 树形表格展示数据 -->
      <tree-table :data="cateList" :columns="columns" show-index border stripe :selection-type="false" :expand-type="false">
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success"></i>
          <i v-else class="el-icon-error"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" type="primary">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="danger">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="setting" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
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
    <!-- 添加分类Dialog -->
    <el-dialog
      title="添加分类"
      @close="clearAddCateDialog"
      :visible.sync="addCateDialogVisible">
      <el-form label-width="100px" :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" placeholder="请输入分类名"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择 v-model：选中的值，options：数据源，props：绑定规则 -->
          <el-cascader
            v-model="selectedParentKeys"
            :options="parentCate"
            :props="parentCateProps"
            clearable
            >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类Dialog -->
    <el-dialog
      title="编辑分类"
      @close="clearEditCateDialog"
      :visible.sync="editCateDialogVisible">
      <el-form label-width="100px" :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" placeholder="请输入分类名"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 定义分页查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据总数
      total: 0,
      // 从API查出的分类数据
      cateList: [],
      // 定义列名和属性绑定
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          props: 'cat_level',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'setting'
        }
      ],
      // 添加分类Dialog可见标示
      addCateDialogVisible: false,
      // 定义添加分类的Form表单属性
      addCateForm: {
        // 父级Id,默认为0,代表当前分类为一级分类没有父级
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类登记,默认为0，代表当前为一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '分类名不可为空', trigger: 'blur' }
        ]
      },
      // 级联选择选中的值,必须是个数组
      selectedParentKeys: [],
      // 所有的一级和二级分类数据
      parentCate: [],
      // 配置级联数据绑定规则
      parentCateProps: {
        // 悬浮展开下一层
        expandTrigger: 'hover',
        // 选中的节点的value
        value: 'cat_id',
        // 展示在眼前的
        label: 'cat_name',
        // 子级联属性
        children: 'children',
        // 是否可以直接选择父节点
        checkStrictly: true
      },
      // 编辑Dialog的显示与关闭
      editCateDialogVisible: false,
      // 编辑分类Form表单数据
      editCateForm: {
        id: '',
        cat_name: ''
      },
      // 编辑分类Form校验规则
      editCateFormRules: {
        cat_name: [
          {
            required: true, message: '分类名不可为空', trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 通过API查询所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 分页页数发生变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 分页 每页大小发生变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 显示添加分类对话框,并且查出一级和二级的分类
    async showAddCateDialog() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败!')
      this.parentCate = res.data
      this.addCateDialogVisible = true
    },
    // 关闭添加分类清空数据和校验
    clearAddCateDialog() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedParentKeys = []
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const keyLength = this.selectedParentKeys.length
        // 选中的节点大于0说明不是一级节点了
        if (keyLength > 0) {
          // 父类节点就是选中节点数组的最后一个数
          this.addCateForm.cat_pid = this.selectedParentKeys[keyLength - 1]
          // 当前等级就是数组的长度,0就代表一级,1就代表二级，2就代表三级
          this.addCateForm.cat_level = keyLength
          // 否则就代表没有选中父节点，他本身就是一级节点
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        // 添加角色成功，先提示，后关闭Dialog，在刷新列表
        this.$message.success('添加分类成功')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    // 显示编辑分类Dialog
    showEditCateDialog(row) {
      this.editCateForm.id = row.cat_id
      this.editCateForm.cat_name = row.cat_name
      this.editCateDialogVisible = true
    },
    // 关闭编辑分类清空数据和校验
    clearEditCateDialog() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 提交编辑分类表单
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 删除分类
    removeCate(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success(res.meta.msg)
        this.getCateList()
      }).catch(() => {
        return this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 15px;
}
.el-icon-success {
  color: lightgreen;
}
.el-icon-error {
  color: red;
}
.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
