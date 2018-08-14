//buy.js
import {IMG_OSS_TIAO} from "../../constants/constants"

Page({
	data: {
		IMG_OSS_TIAO,
		local_toBuy:wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{},
		userInfo:wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
	},
	onLoad: function () {
	},
	/**
	 * 每次进入都重新获取本地数据
	 */
	onShow: function () {
		let local_toBuy = wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{}
		this.setData({local_toBuy})
	},
	handlePay: function () {
		//生成订单
		this._onCreateOrder()
	},
	// _onCreateOrder: function () {
	// 	const {userInfo}=this.data
	// 	const _this = this
	// 	wx.request({
	// 		url: API.BUY_CREATE_ORDER,
	// 		data: {
	// 			// tel: this.data.tel
	// 		},
	// 		method: 'POST',
	// 		header: {
	// 			"token": userInfo.token
	// 		},
	// 		success: function (res) {
	// 			const {code='', data={}, message=''} = res.data
	// 			if( code===200 ){
	// 				return console.log(data); 
	// 			}
	// 			return _this.toast.warning(message)
	// 		},
	// 		fail: function (res) {
	// 			return _this.toast.error('请求失败，请刷新重试')
	// 		}
	// 	})
	// }
})
