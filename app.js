//app.js
// var tdweapp = require('./utils/sdk/tdweapp.js');
App({
  onLaunch: function () {
    // // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },
  globalData: {
    tokenInvalid: ()=>{
		const userInfo = wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		if(userInfo.uid && userInfo.token) {
			return true	
		} else {
			wx.showModal({
				title: '您未绑定',
				content: '现在去点击“绑定手机号”吗？',
				success: function(res) {
					if (res.confirm) {
						wx.switchTab({
							url: '/pages/mine/mine'
						})
					} else if (res.cancel) {
					}
				}
			})
			return false
		}
    }
  }
})