<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">订单管理</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">订单列表</el-breadcrumb-item>
    </breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            v-model="queryInfo.query"
            clearable
            @clear="getOrdersList()"
            placeholder="请输入内容"
          >
          <el-button
            slot="append"
            @click="getOrdersList()"
            icon="el-icon-search"
          ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 数据表格 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" width="300" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" width="100" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" width="130" prop="order_pay">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width="100" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" width="220" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-tooltip content="修改订单地址" placement="top">
              <el-button @click="showAddressDialog(scope.row)" size="mini" type="primary" class="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip content="物流信息" placement="top">
              <el-button @click="showWuLiuDialog(scope.row)" size="mini" type="success" class="el-icon-location"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改订单地址的Dialog -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      @close="clearAddressDialog"
      width="50%">
      <!-- 省市区县、详细地址表单 -->
      <el-form label-width="100px" :model="addressForm" :rules="addressFormRules" ref="addressFormRef">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityList"
            :props="catyProps">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" placeholder="请填写详细地址"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息的Dialog -->
    <el-dialog
      title="查看物流进度"
      :visible.sync="wuliuDialogVisible"
      width="50%">
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in wuliu"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityList from './citydata'
export default {
  data() {
    return {
      // 分页条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      ordersList: [],
      // 订单列表总数
      total: 0,
      // 修改订单地址Dialog显示关闭
      addressDialogVisible: false,
      // 省市区县数据
      cityList: cityList,
      // 级联绑定规则对象
      catyProps: {
        expandTrigger: 'hover',
        label: 'label',
        value: 'value',
        children: 'children'
      },
      // 地址表单
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 控制物流dialog显示与关闭
      wuliuDialogVisible: false,
      // 物流信息
      wuliu: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取所有订单列表
    async getOrdersList() {
      console.log(this.queryInfo)
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败!')
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 分页大小变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 分页页数变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrdersList()
    },
    // 显示地址Dialog
    showAddressDialog(row) {
      this.addressDialogVisible = true
    },
    // 关闭修改地址对话框清空验证
    clearAddressDialog() {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流Dialog
    async showWuLiuDialog(row) {
      this.wuliuDialogVisible = true
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      } else {
        this.wuliu = res.data
        console.log(this.wuliu)
      }
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
.el-cascader {
  width: 100%;
}
</style>
