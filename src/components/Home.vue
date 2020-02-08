<template>
<el-container class="home_container">
  <!-- 头部区域 -->
  <el-header>
    <div>
      <img src="../assets/image/heima.png" alt="">
      <span>商品后台管理系统</span>
    </div>
     <el-button type="info" @click="loginout">退出</el-button>
  </el-header>
  <!-- 页面主体区域 -->
  <el-container>
    <!-- 侧边栏区域 -->
    <el-aside :width="istoggleCollapse? '64px' : '200px'">
      <div class="toggleMenu" @click="toggleCollapse" >|||</div>
      <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      :unique-opened = "true"
      :collapse="istoggleCollapse"
      :collapse-transition="false"
      router
     :default-active = "$route.path"
      >
      <!-- 一级菜单 -->
      <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconObj[item.id]"></i>
          <!-- 一级菜单名称 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧内容区域 -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
import { request } from '../network/request.js'
export default {
  name: '',
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      // 字体图标
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠
      istoggleCollapse: false
    }
  },
  computed: {
  },
  watch: {
  },
  created () {
    this.getMenuList()
  },
  methods: {
    // 退出
    loginout () {
      window.sessionStorage.clear()
      this.$router.push('login')
    },
    // 加载左侧菜单数据
    async getMenuList () {
      const { data: res } = await request({
        url: '/menus'
      })
      // console.log(res)
      this.menuList = res.data
    },
    // 点击按钮切换菜单栏折叠与展开
    toggleCollapse () {
      this.istoggleCollapse = !this.istoggleCollapse
    }
  }
}
</script>

<style lang='less' scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #353a3c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 5px;
  color: #fff;
  font-size: 20px;
  > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 10px;
      }
  }
}
.el-aside {
  background-color: #323743;
  .toggleMenu {
    background-color: #4a5064;
    color: #fff;
    font-size: 10px;
    text-align: center;
    line-height: 2em;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
  border-right: 0;
  }
  .iconfont {
  margin-right: 10px;
}
}
.el-main {
   background-color: #e9edf0;
}
</style>
