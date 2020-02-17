<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center :closable="false" show-icon></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormrRules"
        ref="addFormRef"
        label-width="80px"
        label-position="top"
      >
        <!-- 表单区域 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTableLeave"
          @tab-click="handleTabChange"
        >
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
            <el-form-item label="商品分类" prop="goods_number">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateListData"
                :props="selectProps"
                @change="handleSelectedChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="hangUploadSuccess"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <el-button type="primary" class="btn_add" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览框 -->
    <el-dialog title="图片预览" :visible.sync="dialogVisible" width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import { request } from '@/network/request.js'
import _ from 'lodash'
export default {
  name: '',
  data () {
    return {
      // 进度步骤激活索引
      activeIndex: 0,

      // 添加商品表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 上传的图片临时路径（对象）数组
        pics: [],
        // 动态参数与静态属性数组
        attrs: [],
        goods_introduce: ''
      },
      // 添加规则
      addFormrRules: {
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
        ]

      },
      // 商品分类数据
      cateListData: [],
      // 级联选择规则配置对象
      selectProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id'
      },
      // 动态参数数据
      manyData: [],
      // 静态属性数据
      onlyData: [],
      // 上传图片的URL地址
      uploadUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览地址
      previewPath: '',
      dialogVisible: false
    }
  },
  computed: {
    // 商品分类id
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  watch: {},
  created () {
    this.getCateList()
  },
  methods: {
    // 处理标签切换
    beforeTableLeave (activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)

      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 级联选择改变
    handleSelectedChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await request({
        url: '/categories'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // console.log(res)
      this.cateListData = res.data
    },
    // 处理标签页切换事件
    async handleTabChange () {
      // 判断是否为动态参数项
      if (this.activeIndex === '1') {
        const { data: res } = await request({
          url: `/categories/${this.cateId}/attributes`,
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }

        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        // console.log(res.data)
        this.manyData = res.data
        // 判断是否为静态属性项
      } else if (this.activeIndex === '2') {
        const { data: res } = await request({
          url: `/categories/${this.cateId}/attributes`,
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        // console.log(res.data)
        this.onlyData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove (file) {
      // 1. 获取将要删除的图片的临时路径
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(item => {
        return item.pic === file.response.data.tmp_path
      })
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除

      this.addForm.pics.splice(index, 1)
      // console.log(file.response.data.tmp_path)
    },

    // 监听图片上传成功的事件
    hangUploadSuccess (response) {
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      // console.log(response.data.url)
    },
    // 添加商品
    addGoods () {
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return this.$message.error('请输入正确的表单项')

        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = this.addForm.goods_cat.join(',')
        // 处理动态参数

        this.manyData.forEach(item => {
          const newInfo = {
            'attr_id': item.attr_id,
            'attr_value': item.attr_vals.join(' ')
          }
          form.attrs.push(newInfo)
        })

        // 处理静态属性
        this.onlyData.forEach(item => {
          const newInfo = {
            'attr_id': item.attr_id,
            'attr_value': item.attr_vals
          }
          form.attrs.push(newInfo)
        })
        console.log(form)
        // 发起请求添加商品
        const { data: res } = await request({
          url: '/goods',
          method: 'post',
          data: form
        })
        console.log(res)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
        // 商品的名称，必须是唯一的
      })
    }
  }
}
</script>

<style lang='less' scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btn_add {
    margin-top: 15px;
}
</style>
