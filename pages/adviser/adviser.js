//index.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		list: [],
		uid: 0 // 当前选择的顾问id
	},
	onReady: function () {
		this.toast=this.selectComponent("#toast")
		const _this=this;
		wx.request({
			url: API.ADVISER_SHOP_LIST,
			data: {
				shopId: 26
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {message='',code='',data} = res.data
				if( code===200 ){
					return _this.setData({list:data,uid:data[0]?data[0].uid:0})
				}
				return _this.toast.info(message)
			},
			fail: function (res) {
				return _this.toast.info('请求失败，请刷新重试')
			}
		})
	},
	handleChooseAdvise: function(e){
		console.log(e.currentTarget.dataset);
	}
})
