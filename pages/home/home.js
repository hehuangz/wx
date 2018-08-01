//honme.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()

Page({
	data: {
		imgUrls: [
			'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
			'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
			'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
		],
		currentTab: 0
	},
	onReady: function () {
		// wx.request({
		// 	url: API.LOGIN_CREATECODE,
		// 	data: {
		// 		tel: this.data.tel
		// 	},
		// 	method: 'POST',
		// 	header: {
		// 	},
		// 	success: function (res) {
		// 		if( code===200 ){
		// 		}
		// 	},
		// 	fail: function (res) {
		// 		// return _this.toast.info('请求失败，请刷新重试')
		// 	}
		// })
	},
	//滑动切换
	swiperTab: function (e) {
		var that = this;
		that.setData({
		  	currentTab: e.detail.current
		});
	},
	//点击切换
	clickTab: function (e) {
		var that = this;
		if (this.data.currentTab === e.target.dataset.current) {
			return false;
		} else {
			that.setData({
				currentTab: e.target.dataset.current
			})
		}
	}
})
