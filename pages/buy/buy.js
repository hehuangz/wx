//buy.js
import {IMG_OSS_TIAO} from "../../constants/constants"
import API from '../../constants/apiRoot'

Page({
	data: {
		IMG_OSS_TIAO,
		local_toBuy: wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{},
		userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		delivery:[{
			name:'到店取货',
			type: 1
		},{
			name: '送货上门',
			type: 2
		}],
		deliveryType: 2,
		address: wx.getStorageSync('wt_wxAddress')?wx.getStorageSync('wt_wxAddress'):{},
	},
	onLoad: function () {
		this.toast=this.selectComponent("#toast")
		this.setData({
			local_toBuy: wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{},
			address: wx.getStorageSync('wt_wxAddress')?wx.getStorageSync('wt_wxAddress'):{},
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		})
		!this.data.address.addressId && this._onGetAddress()

		// 兼容获取用户地址授权失败的情况
		wx.getSetting({//先获取用户当前的设置
			success(res) {
				if (!res.authSetting['scope.address']) {
					wx.authorize({
						scope: 'scope.address',
						success(res) {
							console.log(res.errMsg);//用户授权后执行方法
						},
						fail(res){
						//用户拒绝授权后执行
						}
					})
				}
			}
		})
	},
	/**
	 * 每次进入都重新获取本地数据
	 */
	onShow: function () {
		let local_toBuy = wx.getStorageSync('wt_toBuy')?wx.getStorageSync('wt_toBuy'):{}
		this.setData({local_toBuy})
	},
	_onGetAddress: function(){
		const {userInfo} = this.data;
		const _this=this
		userInfo.uid && wx.request({
			url: API.BUY_DEFAULT_ADDRESS,
			data: {
				"uid": userInfo.uid
			},
			method: 'GET',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({address:data && {}});
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	// 选择配送方式
	handleDeliveryType: function (e) {
		let type = e.currentTarget.dataset.type
		this.setData({deliveryType:type})
	},
	// 生成订单
	handleCreatOrder: function () {
		const {userInfo,deliveryType,local_toBuy,address}=this.data
		const _this = this
		let params=null
		if(deliveryType==1){
			params={
				deliveryType,
				ordersGoods: local_toBuy.ordersGoods,
				uid: userInfo.uid
			}
		}else {
			params={
				addressId: address.addressId,
				deliveryType,
				ordersGoods: local_toBuy.ordersGoods,
				uid: userInfo.uid
			}
		}
		wx.request({
			url: API.BUY_CREATE_ORDER,
			data: params,
			method: 'POST',
			header: {
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return wx.navigateTo({
						url:`/pages/pay/pay?orderPid=${data.orderPid}&price=${local_toBuy.priceTotal}`
					})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	handleGetAddress: function () {
		const {userInfo} = this.data
		const _this = this
		// 同意授权
		wx.chooseAddress({
			success: function (wxres) {
				_this._onSaveWxAddress(wxres)
				
			}
		})
		// 拒绝后的方式,打开设置
		wx.getSetting({
			success(res) {
				if (!res.authSetting['scope.address']) {
					wx.openSetting({})
				}else{
					//打开选择地址
					wx.chooseAddress({
						success: function (wxres) {
							_this._onSaveWxAddress(wxres)
						}
					})
				}
			},
			fail(res){
				console.log('调用失败')
			}
		})	
	},
	_onSaveWxAddress: function (wxres) {
		const {userInfo} = this.data
		const _this = this
		let params = {
			"cityName": wxres.cityName,
			"detailAddress": wxres.detailInfo,
			"districtName": wxres.countyName,
			"mobile": 19957895517,
			// "mobile": wxres.telNumber,
			"provinceName": wxres.provinceName,
			"uid": userInfo.uid,
			"username": wxres.userName
		}
		
		wxres && wx.request({
			url: API.BUY_WECHAT_ADDRESS_SAVE,
			data: params,
			method: 'POST',
			header: {
				"toKen": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 && data){
					let address={
						addressId: data,
						...params
					}
					return _this.setData({address},()=>{
						wx.setStorage({
							key: "wt_wxAddress",
							data: address
						})
					})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
					
	}
})
