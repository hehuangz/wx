//index.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		userInfo:wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		data: {}
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		const {sn} = options
		sn && this._onGetData(sn)
	},
	_onGetData: function(sn){
		const {userInfo} = this.data
		const _this = this;
		wx.showLoading({
			title: '加载中',
		})
		wx.request({
			url: API.ORDER_LOGOSTICS,
			data: { sn },
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					console.log(data);
					return _this.setData({data})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
			}
		})
	}
})
