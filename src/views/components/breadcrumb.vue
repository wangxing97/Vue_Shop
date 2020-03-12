<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <slot name="var1"></slot>
      <slot name="var2"></slot>
    </el-breadcrumb>
  </div>
</template>
