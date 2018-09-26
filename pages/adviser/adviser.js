//index.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		list: [],
		uid: null, // 当前选择的顾问id
		shopId: null
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		const {shopId='',cid=''} = options
		shopId && this.setData({shopId,uid:cid},()=>{
			this._onGetData()
		})
	},
	_onGetData: function () {
		const {shopId} = this.data
		const _this=this;
		wx.request({
			url: API.ADVISER_SHOP_LIST,
			data: {
				shopId
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
			}
		})
	},
	handleChooseAdvise: function(e){
		const {uid}=this.data;
		const current=e.currentTarget.dataset.current
		/**
		 * 重复点击无效
		 * 点击后附上颜色，返回上一页
		 */
		current.uid!=uid && this.setData({uid:current.uid},()=>{
			setTimeout(() => {
				const pages=getCurrentPages()
				let prevPage=pages[pages.length-2] // 上个页面
				prevPage && prevPage.setData({
					adviser: {uid:current.uid,name:current.name}
				})
				wx.navigateBack()
			}, 200);
		})
	}
})
