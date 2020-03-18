<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">商品添加</el-breadcrumb-item>
    </breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条 -->
      <el-steps :active="stepActiveIndex - 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧导航栏 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs @tab-click="tabClick" :tab-position="'left'" v-model="stepActiveIndex" :before-leave="beforeLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item class="cateName" :label="item.attr_name" v-for="item in cateManyAttr" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="wx" v-for="(wx, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in cateOnlyAttr" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="picAction"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="myToken"
              :on-success="onSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加按钮 -->
            <el-button type="primary" class="btnAdd" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="38%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 步骤条当前激活索引
      stepActiveIndex: '0',
      // 添加商品Form数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品列表分类
      cateList: [],
      // 级联选择器绑定规则
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover',
        children: 'children'
      },
      // 商品分类的动态参数
      cateManyAttr: [],
      // 商品分类的静态参数
      cateOnlyAttr: [],
      // 上传图片暂存区
      picAction: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 请求头放入Token
      myToken: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      previewPath: '',
      // 图片预览dialog是否可见
      previewVisible: false
    }
  },
  created() {
    this.getGoodCate()
  },
  methods: {
    async getGoodCate() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.cateList = res.data
    },
    // 级联选择框发生改变
    handleChange() {
      // 只让级联选择框选中第三级
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return null
      }
    },
    // 标签页切换钩子函数
    beforeLeave(newActive, oldActive) {
      if (oldActive === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 标签页发生改变
    async tabClick() {
      // 获取动态参数
      if (this.stepActiveIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.cateManyAttr = res.data
        // 获取静态参数
      } else if (this.stepActiveIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取静态参数失败')
        this.cateOnlyAttr = res.data
      }
    },
    // 图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 移除图片
    handleRemove(file) {
      // 查询出当前图片在pics的索引
      const filepath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filepath)
      // 删除pics里路径
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 图片上传成功
    onSuccess(res) {
      const pic = { pic: res.data.tmp_path }
      this.addForm.pics.push(pic)
    },
    // 添加商品
    addGood() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请先填写必填项!')
        // 先将vue中的值JSON格式化后在格式化回来，直接赋值他俩的地址是一样的
        const form = JSON.parse(JSON.stringify(this.addForm))
        form.goods_cat = form.goods_cat.join(',')
        // 添加动态参数
        this.cateManyAttr.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') })
        })
        // 添加静态属性
        this.cateOnlyAttr.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
        })
        // console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 18px 0;
}
.el-checkbox {
  margin-right: 3px;
}
.cateName {
  margin: 3px 0;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>

<style>
/* 因为scoped只对当前页有效,所以设置引入进来的组件设置样式不能使用scoped */
.ql-editor {
  height: 300px !important;
}
</style>
