<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">商品列表</el-breadcrumb-item>
    </breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList()"
            placeholder="请输入内容"
          >
            <el-button
              slot="append"
              @click="serachByKey"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="goGoodAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 数据表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="100"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="85"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="145">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <el-button
              type="primary"
              class="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              @click="removeGood(scope.row.goods_id)"
              class="el-icon-delete"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表格数据
      goodsList: [],
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数据条数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 当前每页大小发生变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页数发生变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 根据关键字搜索商品
    serachByKey() {
      if (
        this.queryInfo.query.length !== 0 &&
        this.queryInfo.query.trim() === ''
      ) {
        this.queryInfo.query = ''
      } else {
        this.getGoodsList()
      }
    },
    // 删除商品
    async removeGood(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('goods/' + id)
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('删除商品失败')
          this.$message.success('删除成功')
          this.getGoodsList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击添加商品跳转到添加页面
    goGoodAdd() {
      this.$router.push('goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 12px;
}
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
