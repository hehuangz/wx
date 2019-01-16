Page({
	data: {
		orderId: '',
		result: null,
		token: ''
	},
	onLoad: function (options) {
		wx.showLoading({
			title: '加载中'
		})
		const { orderId, token } = options
		orderId && this.setData({orderId, token})
		/**
		 * 获取openId
		 */
		this.getOpenId()
	},
	getOpenId: function () {
		const _this = this
		wx.login({
			success: function(res){
				if(res.code){
					_this.toPay(res.code)
				}
			}
		})
	},
	toPay: function (codeNo) {
		const {orderId, token} = this.data
		if(!orderId)return
		const _this = this
		wx.request({
			url: 'https://sdk-pre.youximao.com/web/trade/getWechatSmallPayInfo',
			data: {
				orderId,
				codeNo
			},
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": token 
			},
			method: 'POST',
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code==='000' ){
					return _this._onWxPay(data);
				} else {
					wx.showToast({
						title: '请求数据失败',
						icon: 'none',
						duration: 2000
					})
				}
			},
			fail: function (res) {
				wx.showToast({
					title: '请求失败，请刷新重试',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
	_onWxPay: function (data = {}) {
		const _this = this
		wx.hideLoading()
		wx.requestPayment({
			"appId": data.appId,
			"nonceStr": data.nonceStr,
			"package": data.packages,
			"paySign": data.sign,
			"signType": data.signType,
			"timeStamp": data.timeStamp,
			success: function (res) {
				_this.setData({
					result: 1
				})
				wx.showToast({
					title: '成功',
					icon: 'success',
					duration: 2000
				})
			},
			fail: function (res) {
				_this.setData({
					result: 2
				})
				console.log(res)
				wx.showToast({
					title: '支付失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
	launchAppError: function () {
		wx.showToast({
			title: '返回App失败',
			icon: 'none',
			duration: 2000
		})
	}
})
