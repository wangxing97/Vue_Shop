<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <el-breadcrumb-item slot="var1">数据统计</el-breadcrumb-item>
      <el-breadcrumb-item slot="var2">数据报表</el-breadcrumb-item>
    </breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 750px;height:450px;margin-top:15px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  data() {
    return {
      reportsList: ''
    }
  },
  created() {},
  async mounted() {
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取报表数据失败!')
    }
    this.reportsList = res.data
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 指定图表的配置项和数据
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(this.reportsList)
  },
  methods: {}
}
</script>

<style lang="less" scoped></style>
