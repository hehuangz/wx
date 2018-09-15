//honme.js
import API from '../../constants/apiRoot'
import {IMG_OSS_TIAO} from "../../constants/constants"

//获取应用实例
const app = getApp()

Page({
	data: {
		type: 0, //微信支付结果
		orderPid:'',// 1534373634  1534300206
		IMG_OSS_TIAO,
		local_toBuy: wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{},
		userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		result: null, //接口查询支付是否成功
	},
	onLoad(options){
		// 重新赋值，不要在data中给默认值，否则进去一次，第二次进去不会加载
		this.setData({
			local_toBuy: wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{},
		})
		this.toast=this.selectComponent("#toast")
		const {type=0,orderPid}=options
		orderPid && this.setData({type,orderPid},()=>{
			this._onCheckOrder()
		})
	},
	_onCheckOrder(){
		const {userInfo,orderPid}=this.data
		const _this=this
		wx.request({
			url: API.PAY_RESULT,
			data: {
				orderPid
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 && data==true){
					return _this.setData({
						result: true
					});
				}
				// return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				setTimeout(()=>{
					wx.navigateTo({
						url: '/pages/order/order'
					})
				},2000)	
			}
		})
	},
	handleToHome(){
		wx.switchTab({url:'/pages/home/home'})
	},
	handleToShare(){
		// wx.redirectTo({url:'/pages/home/home'})
	}
})
