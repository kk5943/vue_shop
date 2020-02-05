<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
        <div class="avatar_box">
          <img src="../assets/logo.png" alt="">
        </div>
      <!-- 登录表单区域 -->
      <el-form label-width="0" class="login_form" :model="ruleForm" :rules="loginFormRules" ref="loginFormRef">
        <!-- 用户名 -->
         <el-form-item prop="username">
           <el-input  prefix-icon="iconfont icon-user"  v-model="ruleForm.username"></el-input>
         </el-form-item>
          <!-- 密码 -->
         <el-form-item  prop="password">
           <el-input  prefix-icon="iconfont icon-3702mima" v-model="ruleForm.password" type="password"></el-input>
         </el-form-item>

        <el-form-item class="btns">
           <el-button type="primary" @click="login">登录</el-button>
           <el-button type="info" @click="resetLoginForm">重置</el-button>
         </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { request } from '../network/request.js'
export default {
  name: '',
  data () {
    return {
      // 登录表单数据绑定的对象
      ruleForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    // 重置登录表单
    resetLoginForm () {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 登录验证
    login () {
      // console.log('hhh')
      this.$refs.loginFormRef.validate(async vaild => {
        // 表单不合法
        if (!vaild) return
        const { data: res } = await request({
          url: '/login',
          method: 'post',
          data: this.ruleForm
        })
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    height: 100%;
    background-color: #2b4b6b;
    .login_box {
      width: 450px;
      height: 300px;
      background-color: #fff;
      border-radius: 5px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .avatar_box {
        width: 130px;
        height: 130px;
        position: absolute;
        padding: 15px;
        border-radius: 50%;
        box-shadow: 0 0 10px #ddd;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
          }
      }
      .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        .btns {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
</style>
