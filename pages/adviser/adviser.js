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
		const {uid}=this.data;
		const current=e.currentTarget.dataset.current
		/**
		 * 重复点击无效
		 * 点击后附上颜色，返回上一页
		 * 把选择的顾问存本地，返回
		 */
		current.uid!=uid && this.setData({uid:current.uid},()=>{
			setTimeout(() => {
				const pages=getCurrentPages()
				let prevPage=pages[pages.length-2] // 上个页面
				prevPage && prevPage.setData({
					adviser: {uid:current.uid,username:current.username}
				})
				wx.navigateBack()
			}, 200);
		})
	}
})
