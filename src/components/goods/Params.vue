<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert title="注意！只允许设置第三级分类相关参数" show-icon :closable="false" type="warning"></el-alert>

      <!-- 商品分类选择区域 -->
      <el-row class="cate_optin">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 商品分类级联选择区域 -->
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="selectProps"
            @change="handleSelectChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>

          <!-- 动态参数表格数据 -->
          <el-table :data="manyParamsData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  :key="i"
                  v-for="(item, i) in slotProps.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(index, slotProps.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>

            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                 <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row.attr_id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialog(slotProps.row.attr_id)">删除</el-button>
              </template>

            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格数据 -->
          <el-table :data="manyParamsData" style="width: 100%" border stripe>
            <el-table-column type="expand"></el-table-column>

            <el-table-column type="index" label="#"></el-table-column>

            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="this.activeName === 'many' ? '动态参数' : '静态属性'"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addrRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="this.activeName === 'many' ? '动态参数' : '静态属性'" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="this.activeName === 'many' ? '动态参数' : '静态属性'"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="this.activeName === 'many' ? '动态参数' : '静态属性'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
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
      // 选中的选项
      selectKeys: [],
      // 商品分类数据
      cateList: [],

      // 级联选择配置对象
      selectProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 参数列表
      paramsList: [],
      // 标签选中参数
      activeName: 'many',
      // 动态参数数据
      manyParamsData: [],
      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数对象
      addForm: {
        name: ''
      },
      addrRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 控制修改参数对话框的显示与隐藏
      editDialogVisible: false,
      // 添加参数对象
      editForm: {},
      editRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    // 分类ID
    cateId () {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    }
  },
  watch: {},
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await request({
        url: '/categories'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      // console.log(res)
      this.cateList = res.data
    },
    // 监听选中项的改变
    handleSelectChange () {
      // console.log(this.selectKeys)

      this.getParamsList()
    },
    // 获取参数列表数据
    async getParamsList () {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyParamsData = []
        return
      }
      const { data: res } = await request({
        url: `/categories/${this.cateId}/attributes`,
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表数据失败')
      }
      // console.log(res)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      this.manyParamsData = res.data
    },
    // 监听tab切换事件
    handleTabClick (tab, event) {
      // console.log(tab, event)
      this.getParamsList()
    },
    // 监听添加参数对话框关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 处理添加参数
    addParams () {
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await request({
          url: `/categories/${this.cateId}/attributes`,
          method: 'post',
          data: {
            attr_name: this.addForm.name,
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        // console.log(res)
        this.$message.success('添加参数成功')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 保存参数选项到数据库
    async saveAttrvals (row) {
      const { data: res } = await request({
        url: `/categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'put',
        data: {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.inputValue
        }
      })
      if (res.meta.status !== 200) return this.$message.error('添加参数失败')
      this.$message.success('更改参数选项值成功')
    },
    // 处理输入框完成
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrvals(row)
    },
    // 展示输入框
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 处理删除
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
    },
    // 编辑参数对话框
    async showEditDialog (id) {
      const { data: res } = await request({
        url: `/categories/${this.cateId}/attributes/${id}`,
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data

      this.editDialogVisible = true
    },
    // 修改编辑参数
    editParams () {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await request({
          url: `/categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          method: 'put',
          data: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 200) return this.$message.error('添加参数失败')
        // console.log(res)
        this.$message.success('添加参数成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 监听修改参数的表单关闭
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    async removeDialog (id) {
      const { data: res } = await request({
        url: `/categories/${this.cateId}/attributes/${id}`,
        method: 'delete'
      })
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      // console.log(res)
      this.$message.success('删除参数成功')
      this.getParamsList()
      this.editDialogVisible = false
    }
  }
}
</script>

<style lang='less' scoped>
.cate_optin {
  margin-top: 15px;
}
.el-cascader {
  margin-left: 15px;
}
.input-new-tag {
  width: 120px;
}
.el-tag {
  margin-right: 10px;
}
</style>
