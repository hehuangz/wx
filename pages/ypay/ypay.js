Page({
	data: {
		orderId: '',
		price: '10'
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
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
					wx.setClipboardData({
						data: res.code
					})
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
			url: 'http://testgamecatsdk.youximao.cn/web/trade/getWechatSmallPayInfo',
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
				console.log(res)
				const {code='', data={}, message=''} = res.data
				if( code==='200' ){
					return _this._onWxPay(data);
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	_onWxPay: function (data = {}) {
		const _this = this
		wx.requestPayment({
			"appId": data.appId,
			"nonceStr": data.nonceStr,
			"package": data.package,
			"signType": data.signType,
			"timeStamp": data.timeStamp,
			success: function (res) {
				_this.toast.success('支付成功')
			},
			fail: function (res) {
				return _this.toast.error('支付失败')
			}
		})
	}
})
