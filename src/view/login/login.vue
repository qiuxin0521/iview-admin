<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip" style="color: red">{{errorTip}}</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  data () {
    return {
      errorTip: ''
    }
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      let _this = this
      _this.$data.errorTip = ''
      this.handleLogin({ userName, password }).then(res => {
        this.getUserInfo().then(res => {
          this.$router.push({
            name: 'home'
          })
        })
      }, error => {
        if (error.response) {
          let data = error.response.data
          if (data && data.error) {
            _this.$data.errorTip = data.error
          } else {
            _this.$data.errorTip = '登录失败，请重试'
          }
        } else {
          _this.$data.errorTip = '系统内部异常，请联系管理员'
        }
      })
    }
  }
}
</script>

<style>

</style>
