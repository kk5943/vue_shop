<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入查询的订单">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="OrdersTableData" borderr stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="180"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="180"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="180">
           <template v-slot="slotProps">
          <el-tag type="success" v-if="slotProps.row.order_pay === '1'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
           </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="180"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
           <template v-slot="slotProps">
             {{slotProps.row.create_time | dataFormat}}
           </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showAddress"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改地址对话框 -->

    <el-dialog
      title="修改地址对话框"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData" :props="selectProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <el-timeline >
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '@/network/request.js'
import cityData from './citydata.js'
export default {
  name: '',
  data () {
    return {
      // 订单列表数据
      ordersListData: [],
      // 订单数据请求参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总条数
      total: 0,
      OrdersTableData: [],
      // 修改地址框的显示与隐藏
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'change' }
        ]
      },
      progressDialogVisible: false,
      progressInfo: [],
      selectProps: {
        label: 'label',
        value: 'value',
        expandTrigger: 'hover'
      },
      cityData
    }
  },
  computed: {},
  watch: {},
  created () {
    this.getOrdersList()
  },
  methods: {
    // 获取订单数据
    async getOrdersList () {
      const { data: res } = await request({
        url: 'orders',
        params: this.queryInfo
      })
      // console.log(res)
      this.OrdersTableData = res.data.goods
    },
    // 展示修改地址
    showAddress () {
      this.addressDialogVisible = true
    },
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示物流进度
    async showProgress () {
      const { data: res } = await request({
        url: '/kuaidi/804909574412544580'
      })
      if (res.meta.status !== 200) return this.$message.error('查询订单失败')
      console.log(res)

      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang='less' scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>
