//honme.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()

Page({
	data: {
		list:[],
		mainActiveIndex: 0,
		activeId: 0,
		shop: wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
	},
	onReady: function () {
		this.toast=this.selectComponent("#toast")
		const {id} = this.data.shop
		const _this = this;
		wx.request({
			url: API.CATEGORY_LIST,
			dataType:'formData',
			data: {
				shopId: id
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},		
			success: function (res) {
				const {code='', data={}, message=''}=JSON.parse(res.data) // 因为发过去的是formData的格式，返回的res.data也是字符串的
				if(code===200) {
					return _this.setData({
						list:data,
						activeId: data && data[0].id // 默认选中第一个
					})
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
	/**
	 * 点击一级分类
	 */
	handleTap: function (e) {
		if (this.data.activeId === e.currentTarget.dataset.current) {
			return false;
		} else {
			this.setData({
				activeId: e.currentTarget.dataset.current
			})
		}
	},
	/**
	 * 点击三级分类图片跳转到搜索列表
	 */
	handleToSearch: function (e) {
		const thirdId=e.currentTarget.dataset.id;
		const {id} = this.data.shop;		 
		wx.navigateTo({url:`/pages/search/search?thirdId=${thirdId}&shopId=${id}`})
	}
})
