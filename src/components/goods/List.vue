<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goodsAdd">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表数据 -->
      <el-table :data="goodsListData" border stripe >
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"  width="80px"></el-table-column>
        <el-table-column  label="创建时间" width="160">
          <template v-slot="slotProps">
            {{slotProps.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotProps">
           <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
           <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsList(slotProps.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页数据 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
import { request } from '../../network/request.js'
export default {
  name: '',
  data () {
    return {
      // 商品请求参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品总条数
      total: 0,
      // 商品列表数据
      goodsListData: []
    }
  },
  computed: {},
  watch: {},
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品数据
    async getGoodsList () {
      const { data: res } = await request({
        url: '/goods',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) { return this.$message.error('获取商品列表数据失败') }
      this.goodsListData = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newPagesize) {
      this.queryInfo.pagesize = newPagesize
      this.getGoodsList()
    },
    handleCurrentChange (newPagenum) {
      this.queryInfo.pagenum = newPagenum
      this.getGoodsList()
    },
    async removeGoodsList (id) {
      const confirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await request({
        url: `goods/${id}`,
        method: 'delete'
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表数据失败')
      this.getGoodsList()
    },
    // 跳转到商品页面
    goodsAdd () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='less' scoped>
</style>
