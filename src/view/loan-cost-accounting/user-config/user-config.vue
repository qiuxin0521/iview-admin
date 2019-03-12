<template>
  <div>
    <Card class="custom-card-margin">
      <p slot="title">修改密码</p>
      <Form ref="modifyPasswordForm" :model="formItem" :label-width="90" :rules="modifyPasswordValidateRules">
        <FormItem label="用户名: " style="padding-right: 40px" prop="userName">
          <div style="font-weight: bold">{{formItem.userName}}</div>
        </FormItem>
        <FormItem label="旧密码: " style="padding-right: 40px; padding-bottom: 20px" prop="oldPassword">
          <Input v-model="formItem.oldPassword" type="password" placeholder="请输入原密码"></Input>
        </FormItem>
        <FormItem label="新密码: " style="padding-right: 40px; padding-bottom: 20px" prop="newPassword">
          <Input v-model="formItem.newPassword" @on-change="newPasswordValidator" type="password" placeholder="请输入新密码"></Input>
        </FormItem>
        <FormItem label="确认新密码: " style="padding-right: 40px" prop="confirmNewPassword">
          <Input v-model="formItem.confirmNewPassword" @on-change="confirmNewPassword" type="password" placeholder="请再次输入新密码"></Input>
        </FormItem>
      </Form>
      <p class="login-tip" style="color: red">{{errorTip}}</p>
    </Card>
    <Button type="primary" @click="modifyPwd" class="custom-button-margin" size="large">确定</Button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'user-config',
  data () {
    return {
      formItem: {
        userId: '',
        userName: '',
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      errorTip: '',
      modifyPasswordValidateRules: {
        oldPassword: [
          {required: true, message: '旧密码不能为空', trigger: 'blur'},
          {type: 'string', pattern: /[A-Za-z0-9_\-\[!@#$%^&\]]+/, min: 1, max: 64, message: '长度1到64个字符，支持大小写英文、数字以及特殊字符', trigger: 'change'}
        ],
        newPassword: [
          {required: true, message: '新密码不能为空', trigger: 'blur'},
          {type: 'string', pattern: /[A-Za-z0-9_\-\[!@#$%^&\]]+/, min: 8, max: 64, message: '至少输入8位密码，最长64位，支持大小写英文、数字以及特殊字符', trigger: 'change'}
        ],
        confirmNewPassword: [
          {required: true, message: '确认新密码不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    ...mapActions([
      'getUserInfo',
      'modifyPassword',
      'handleLogOut'
    ]),
    confirmNewPassword: function (cnp) {
      let newPassword = (this.$data.formItem.newPassword || '').trim()
      let confirmNewPassword = (this.$data.formItem.confirmNewPassword || '').trim()

      if (newPassword !== confirmNewPassword) {
        this.$data.errorTip = '两次输入的新密码不一致'
        return false
      }

      this.$data.errorTip = ''
      return true
    },
    newPasswordValidator: function (np) {
      let strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')
      if (!strongRegex.test(this.$data.formItem.newPassword)) {
        this.$data.errorTip = '新密码至少需要包含1个大写字母，1个小写字母以及1个数字'
        return false
      }

      this.$data.errorTip = ''
      return true
    },
    modifyPwd: function () {
      debugger
      if (!this.newPasswordValidator() || !this.confirmNewPassword()) {
        return
      }

      let _this = this
      let validateResult = this.$refs.modifyPasswordForm.validate()
      validateResult.then(function (result) {
        debugger
        if (!result) {
          return
        }

        _this.modifyPassword({
          userId: _this.$data.formItem.userId,
          userName: _this.$data.formItem.userName,
          oldPassword: _this.$data.formItem.oldPassword,
          newPassword: _this.$data.formItem.newPassword
        }).then(function (resp) {
          _this.$data.formItem.oldPassword = ''
          _this.$data.formItem.newPassword = ''
          _this.$data.formItem.confirmNewPassword = ''

          _this.$Modal.info({
            title: '修改密码',
            content: '修改成功，请重新登录!',
            onOk: () => {
              _this.handleLogOut().then(() => {
                _this.$router.push({
                  name: 'login'
                })
              })
            }
          })
        }, function (error) {
          _this.$data.formItem.oldPassword = ''
          _this.$data.formItem.newPassword = ''
          _this.$data.formItem.confirmNewPassword = ''

          if (error.response) {
            let data = error.response.data
            if (data && data.message) {
              _this.$data.errorTip = data.message
            } else {
              _this.$data.errorTip = '修改密码失败，请稍后重试'
            }
          } else {
            _this.$data.errorTip = '系统内部异常，请联系管理员'
          }
        })
      })
    }
  },
  mounted () {
    let _this = this
    this.$data.errorTip = ''

    this.getUserInfo().then(data => {
      _this.$data.formItem.userId = data.userId
      _this.$data.formItem.userName = data.name
    }, error => {
      let content = '系统内部异常，请联系管理员'
      if (error.response) {
        let data = error.response.data
        if (data) {
          content = data.message || data.error
        } else {
          content = '获取用户信息失败，请联系管理员'
        }
      }
      _this.$Modal.error({
        title: '异常',
        content: content
      })
    })
  }
}
</script>

<style scoped>
  .custom-card-margin {
    margin-bottom: 10px;
    width: 400px;
  }

  .custom-button-margin {
    margin-right: 10px;
  }
</style>
