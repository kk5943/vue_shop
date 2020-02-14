<template>
  <div>
    <!-- 面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" stripe border>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row
              :class="[ i1 === 0 ? 'btop' : '', 'bbottom','vcenter']"
              v-for="(item1,i1) in slotProps.row.children"
              :key="item1.id"
            >
              <el-col :span="6">
                <el-tag
                  closable
                  @close="removeRightsById(slotProps.row, item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="18">
                <el-row
                  :class="[ i2 === 0 ? '' : 'btop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(slotProps.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="danger"
                      closable
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="removeRightsById(slotProps.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top-start">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRightsDialog(slotProps.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="40%"
    >
      <el-tree :data="rightsList" :props="defaultProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defaultCheckedKeys" ref="treeRef"></el-tree>
      <span slot="footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSetRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request.js'
export default {
  name: '',
  data () {
    return {
      // 角色列表数据
      rolesList: [],

      // 分配权限开关
      setRightsDialogVisible: false,

      // 权限列表
      rightsList: [],

      // 树节点默认显示属性
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中节点
      defaultCheckedKeys: [],
      // 角色id
      roleId: ''
    }
  },
  computed: {},
  watch: {},
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据
    async getRolesList () {
      const { data: res } = await request({
        url: '/roles'
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.rolesList = res.data
    },
    // 根据id删除角色权限
    async removeRightsById (role, id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')

      // 发起删除角色权限请求
      const { data: res } = await request({
        url: `/roles/${role.id}/rights/${id}`,
        method: 'delete'
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 重新赋值给角色对象
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightsDialog (role) {
      this.roleId = role.id
      // console.log(role)
      const { data: res } = await request({
        url: '/rights/tree'
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }

      this.rightsList = res.data
      // console.log(this.rightsList)

      // 调用递归遍历所有选中下的最后子节点
      this.getLastKeys(role, this.defaultCheckedKeys)
      // console.log(this.defaultCheckedKeys)

      this.setRightsDialogVisible = true
    },
    // 使用递归的方式遍历子节点的最后权限
    getLastKeys (node, arr) {
      // 递归结束条件
      if (!node.chileren) return arr.push(node.id)
      // console.log(node)

      node.children.forEach(item => this.getLastKeys(item, arr))
    },
    // 处理分配权限
    async handleSetRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      let rids = keys.join(',')
      const { data: res } = await request({
        url: `/roles/${this.roleId}/rights`,
        method: 'post',
        data: {
          rids
        }
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.btop {
  border-top: 1px solid #eee;
}
.bbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
