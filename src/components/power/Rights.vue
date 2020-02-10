<template>
  <div>
    <!-- 面包屑导航區域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 用户列表区域 -->
      <el-table :data="rightsList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级"></el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="slotProps.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { request } from '../../network/request.js'

export default {
  name: '',
  data () {
    return {
      // 权限列表数据
      rightsList: []
    }
  },
  computed: {},
  watch: {},
  created () {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList () {
      const { data: res } = await request({
        url: 'rights/list'
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.rightsList = res.data
    }
  }
}
</script>

<style lang='less' scoped>
</style>
