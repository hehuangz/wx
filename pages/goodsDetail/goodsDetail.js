//logs.js
import API from '../../constants/apiRoot'

Page({
	data: {
		images: []
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")

		console.log(options);
		const {goodId=1} = options
		const _this=this
		wx.request({
			url: API.GOODS_DETAIL,
			data: {
				goodId
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				console.log(res);
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({images:data.images})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	}
	

})
