//index.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		list: [],
		cid: null, // 当前选择的顾问id
		shopId: null,
		isForce: 0 // 是否有强绑定关系
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		const {shopId='',isForce=0,cid=''} = options
		shopId && this.setData({shopId,cid:cid,isForce:Number(isForce)},()=>{
			this._onGetData()
		})
	},
	_onGetData: function () {
		const {shopId,cid} = this.data
		const _this=this;
		wx.showLoading({title:'加载ing'})
		wx.request({
			url: API.COUNSELOR_LIST,
			data: {
				shopId,
				uid: cid
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {message='',code='',data} = res.data
				if( code===200 ){
					return _this.setData({list:data})
				}
				return _this.toast.info(message)
			},
			fail: function (res) {
				return _this.toast.info('请求失败，请刷新重试')
			},
			complete: function () {
				return wx.hideLoading()
			}
		})
	},
	// 解除绑定
	handleRelieve: function (e) {
		let counselorId = e.currentTarget.dataset.current.uid
		let counselorName = e.currentTarget.dataset.current.name
		const _this = this
		if(!app.globalData.tokenInvalid()) return
		wx.showModal({
			title: '提示',
			content: '您确认解除Ta的顾问身份吗？',
			confirmText: '取消',
			cancelText: '确认',
			success: function(res) {
				if (res.confirm) { 
				} else if (res.cancel) {
					// this.triggerEvent("relieveEvent")
					_this._onRelieve(counselorId,counselorName)
				}
			}			
		})
	},
	_onRelieve: function (counselorId,counselorName) {
		const userInfo = wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		if(!userInfo.uid){
			return
		}
		const _this = this
		wx.showLoading({title:'加载中'})
		wx.request({
			url: API.COUNSELOR_RELIEVE,
			data: {
				assistantId: counselorId, 
				uid: userInfo.uid
			},
			method: 'POST',
			header: {
				"token": userInfo.token
			},
			success: function (res) {
				const {code, data={}, message} = res.data
				if( code===200 ){
					_this.toast.info('解除成功！')
					return _this.setData({
						isForce: 0,
						cid: counselorId 
					},()=>{
						let params = {
							uid: counselorId,
							name: counselorName,
							isForce: 0
						}
						wx.setStorage({
							key: 'wt_counselor',
							data: params
						})
					})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
			}
		})
	},
	// 绑定为专属顾问
	handleChoose: function (e) {
		let counselorId = e.currentTarget.dataset.current.uid
		let counselorName = e.currentTarget.dataset.current.name		
		const _this = this
		if(!app.globalData.tokenInvalid()) return
		wx.showModal({
			title: '提示',
			content: '您确认设置Ta为顾问身份吗？',
			success: function(res) {
				if (res.confirm) { 
					_this._onChoose(counselorId,counselorName)
				} else if (res.cancel) {
				}
			}			
		})
	},
	_onChoose: function (counselorId,counselorName) {
		const userInfo = wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		if(!userInfo.uid){
			return
		}
		const _this = this
		wx.showLoading({title:'加载中'})
		wx.request({
			url: API.COUNSELOR_CHOOSE,
			data: {
				assistantId: counselorId, 
				uid: userInfo.uid
			},
			method: 'POST',
			header: {
				"token": userInfo.token
			},
			success: function (res) {
				const {code, data={}, message} = res.data
				if( code===200 ){
					_this.toast.info('绑定成功！')
					const pages=getCurrentPages()
					let prevPage=pages[pages.length-2] // 上个页面
					prevPage && prevPage.setData({
						adviser: {uid:counselorId,name:counselorName}
					})
					return _this.setData({
						isForce: 1,
						cid: counselorId
					},()=>{
						let params = {
							uid: counselorId,
							name: counselorName,
							isForce: 1	
						}
						wx.setStorage({
							key: 'wt_counselor',
							data: params
						})
					})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
			}
		})
	},
	// 点击顾问选中
	handleChooseAdviser: function(e){
		// const {uid}=this.data;
		// const current=e.currentTarget.dataset.current
		// /**
		//  * 重复点击无效
		//  * 点击后附上颜色，返回上一页
		//  * 把选择的顾问存本地，返回
		//  */
		// current.uid!=uid && this.setData({uid:current.uid},()=>{
		// 	setTimeout(() => {
		// 		const pages=getCurrentPages()
		// 		let prevPage=pages[pages.length-2] // 上个页面
		// 		prevPage && prevPage.setData({
		// 			adviser: {uid:current.uid,name:current.name}
		// 		})
		// 		wx.navigateBack()
		// 	}, 200);
		// })
	}
})
