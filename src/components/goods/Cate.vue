<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="tree_table"
        :data="cateList"
        :columns="columns"
        :show-row-hover="false"
        :expand-type="false"
        :selection-type="false"
        border
        show-index
        index-text="#"
      >
        <template v-slot:isok="slotProps">
          <i class="el-icon-success" v-if="!slotProps.row.cat_deleted" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template v-slot:order="slotProps">
          <el-tag v-if="slotProps.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" v-if="slotProps.row.cat_level ===1">二级</el-tag>
          <el-tag type="warning" v-if="slotProps.row.cat_level ===2">三级</el-tag>
        </template>
        <template v-slot:option="slotProps">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
    </el-card>

    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"  width="50%" @close="addCateDialogClosed" :visible.sync="addCateDialogVisible">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentList"
            :props="cascaderProps"
            @change="handleSelectChange"
            clearable

          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '@/network/request.js'
export default {
  name: '',
  data () {
    return {
      // 请求参数对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 获取的商品总条数
      total: 0,
      // 商品列表数据
      cateList: [],
      // 表格树配置
      columns: [
        {
          label: '商品名称',
          prop: 'cat_name'
        },
        {
          label: '有效性',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 分类对话框开关
      addCateDialogVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 选择的分类id组
      selectedKeys: [],

      // 父分类数据
      parentList: [],

      // 分类选择配置项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      }
    }
  },
  computed: {},
  watch: {},
  created () {
    this.getCateLlist()
  },
  methods: {
    // 获取商品列表数据
    async getCateLlist () {
      const { data: res } = await request({
        url: '/categories',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      console.log(res)
      this.total = res.data.total
      this.cateList = res.data.result
    },
    // 页面尺寸变化
    handleSizeChange (newPagesize) {
      // console.log(newPagesize)
      this.queryInfo.pagesize = newPagesize
      this.getCateLlist()
    },
    // 当前页面变化
    handleCurrentChange (newPagenum) {
      // console.log(newPagenum)
      this.queryInfo.pagenum = newPagenum
      this.getCateLlist()
    },
    // 展示分类对话框
    async showCateDialog () {
      const { data: res } = await request({
        url: '/categories',
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      this.parentList = res.data
      this.addCateDialogVisible = true
    },
    // 监听选择分类的改变
    handleSelectChange () {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = [this.selectedKeys.length]
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    async addCate () {
      this.$refs.addCateFormRef.validate(async vaild => {
        if (!vaild) return this.$message.error('请输入正确的名称')

        const { data: res } = await request({
          url: '/categories',
          method: 'post',
          data: this.addCateForm
        })
        if (res.meta.status !== 201) {
          return this.$message.error('获取商品列表数据失败')
        }
        this.getCateLlist()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加对话框关闭重置数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang='less' scoped>
.tree_table {
  margin-top: 15px;
}
</style>
