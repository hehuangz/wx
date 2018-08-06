//honme.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()

Page({
	data: {
		list:[],
		mainActiveIndex: 0,
		activeId: 15
	},
	onReady: function () {
		this.toast=this.selectComponent("#toast")
		const _this = this;
		wx.request({
			url: API.CATEGORY_LIST,
			dataType:'formData',
			data: {
				shopId: 26
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},		
			success: function (res) {
				const {code='', data={}, message=''}=JSON.parse(res.data)
				if(code===200) {
					return _this.setData({list:data})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	handleSearch: function () {
		wx.navigateTo({url:'/pages/search/search'})
	},
	// 扫一扫按钮
	handleSao: function () {
		wx.scanCode({
			success: (res) => {
				console.log('扫码结果',res)
				wx.request({
					url: API.HOME_SAOMA,
					data: {
						
					},
					method: 'POST',
					header: {
					},
					success: function (res) {
						
					},
					fail: function (res) {
						return _this.toast.error('请求失败，请刷新重试')
					}
				})
			}
		})		  
	},
	handleTap: function (e) {
		if (this.data.activeId === e.currentTarget.dataset.current) {
			return false;
		} else {
			this.setData({
				activeId: e.currentTarget.dataset.current
			})
		}
	}
})
