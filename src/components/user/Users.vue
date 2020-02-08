<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
            @clear="getUserList"
            @change="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="adddialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表区域 -->
    <el-table :data="userList" style="width: 100%" stripe border type="index">
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="username" label="用户名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template v-slot:default="slotProps">
          <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template v-slot:default="slotProps">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditialogVisible(slotProps.row.id)"
          ></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserInfo(slotProps.row.id)"></el-button>
          <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="adddialogVisible" width="50%" @close="addDialogClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="editdialogVisible" width="50%" @close="esitDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { request } from '../../network/request.js'

export default {
  name: '',
  data () {
    // 检验邮箱合法性
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!regEmail.test(value)) {
        return callback(new Error('请输入合法邮箱'))
      }

      callback()
    }
    // 检验手机号码合法性
    let checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regMobile.test(value)) {
        return callback(new Error('请输入合法手机号'))
      }
      callback()
    }
    return {
      // 用户列表数据
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数
        pagesize: 3
      },
      total: 0,
      userList: [],
      adddialogVisible: false,
      editdialogVisible: false,
      // 添加用户表单对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单对象
      editForm: {},
      // 添加用户表单规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } = await request({
        url: '/users',
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.total = res.data.total
      this.userList = res.data.users
    },
    // 监听每页显示的条数改变
    handleSizeChange (newpagesize) {
      // console.log(pagesize)
      this.queryInfo.pagesize = newpagesize
      this.getUserList()
    },
    // 监听当前页码改变
    handleCurrentChange (newpagenum) {
      // console.log(pagenum)
      this.queryInfo.pagenum = newpagenum
      this.getUserList()
    },
    // 监听switch 状态发生变化
    async userStateChange (userInfo) {
      const { data: res } = await request({
        url: `/users/${userInfo.id}/state/${userInfo.mg_state}`,
        method: 'put'
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态改变失败')
      }
      return this.$message.success('用户状态改变成功')
    },
    // 监听对话按钮关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async vaild => {
        // 表单不合法
        if (!vaild) return
        // 表单合法后发起请求
        const { data: res } = await request({
          url: '/users',
          method: 'post',
          data: this.addForm
        })
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('用户添加失败')
        }
        this.getUserList()
        this.adddialogVisible = false
      })
    },
    // 展示修改用户信息对话框
    async showEditialogVisible (id) {
      const { data: res } = await request({
        url: '/users/' + id,
        method: 'get'
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('展示用户信息失败')
      }
      this.editForm = res.data
      this.editdialogVisible = true
    },
    // 修改用户信息与提交
    async editUserInfo () {
      const { data: res } = await request({
        url: '/users/' + this.editForm.id,
        method: 'put',
        data: {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        }
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('展示用户信息失败')
      }

      this.getUserList()
      this.editdialogVisible = false
    },
    // 监听修改用户信息提交对话框关闭
    esitDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 删除用户
    async removeUserInfo (id) {
      const confirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')

      // 发起删除用户请求
      const { data: res } = await request({
        url: '/users/' + id,
        method: 'delete'

      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }

      this.getUserList()
    }
  }
}
</script>

<style lang='less' scoped>

</style>
