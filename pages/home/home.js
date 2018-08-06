//honme.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()

Page({
	data: {
		currentTab: 0,
		show: true,
		shop: {},
		adviserList: [], // 顾问列表
		categoryList: [], // 分类列表
	},
	onReady: function () {
		this.dialog=this.selectComponent("#dialog")
		this.toast=this.selectComponent("#toast")
		/**
		 * 获取定位信息
		 */
		this._onLocation()
		/**
		 * 获取顾问列表
		 */
		this._onGetAdviser()
		/**
		 * 获取一级分类
		 */
		this._onGetCategory()

		/**
		 * 没有授权没有拿到微信头像时打开弹窗
		 */
		this._onWxUser()
	},
	_onLocation: function () {
		const _this=this;
		wx.getLocation({
			type: 'wgs84',
			success: function(res) {
				app.globalData.location={latitude:res.latitude,longitude:res.longitude}
				wx.request({
					url: API.HOME_NEARLY_SHOP,
					data: {
						latitude: res.latitude,
						longitude: res.longitude
					},
					method: 'POST',
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					success: function (res) {
						const {code, data, message} = res.data
						if( code===200 ){
							return _this.setData({shop:data})
						}else{
							return _this.toast.warning(message)
						}
					},
					fail: function (res) {
						return _this.toast.error('请求失败，请刷新重试')
					}
				})
			}
		})
	},
	_onWxUser: function () {
		if(!wx.getStorageSync('wx_user') && !wx.getStorageSync('wt_user')){
			this.dialog.showDialog();
			const _this=this;
			wx.getSetting({
				success: function(res){
					if (res.authSetting['scope.userInfo']) {
						// 已经授权，可以直接调用 getUserInfo 获取头像昵称
						wx.getUserInfo({
							success: function(res) {
								wx.setStorage({
									key:"wx_user",
									data:res.userInfo
								})
							}
						})
					}
				}
			})
		}
	},
	// 获取用户头像等
	getUserInfo: function(e){
		wx.setStorage({
			key:"wx_user",
			data:e.detail.userInfo
		})
		this.dialog.hideDialog();
	},
	//滑动切换
	handleSwiper: function (e) {
		var that = this;
		that.setData({
		  	currentTab: e.detail.current
		});
	},
	//点击切换
	handleCategory: function (e) {
		var that = this;
		if (this.data.currentTab === e.target.dataset.current) {
			return false;
		} else {
			that.setData({
				currentTab: e.target.dataset.current
			})
		}
	},
	handleSearch: function () {
		wx.navigateTo({url:'/pages/search/search'})
	},
	/**
	 * 扫一扫按钮
	 */
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
	/**
	 * 获取顾问列表
	 */
	_onGetAdviser: function () {
		const _this = this;
		wx.request({
			url: API.HOME_ADVISER,
			data: {
				shopId: (_this.shop && _this.shop.id) || 26 //---TEMP---
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {code, data, message} = res.data
				if( code===200 ){
					return _this.setData({adviserList:data})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	/**
	 * 获取一级分类
	 */
	_onGetCategory: function () {
		const _this = this;
		wx.request({
			url: API.HOME_CATEGORY_FIRST,
			data: {
				shopId: (_this.shop && _this.shop.id) || 26 //---TEMP---
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				const {code, data=[], message} = res.data
				if( code===200 ){
					return _this.setData({categoryList:data,currentTab:data[0] && data[0].id})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	//dialog取消事件
	_cancelEvent(){
		this.dialog.hideDialog();
	},
	//dialog确认事件
	_confirmEvent(){
		this.dialog.hideDialog();
	}
})
