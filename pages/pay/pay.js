//index.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		userInfo:wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		orderPid: '',
		price: '',
		createTime: ''
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		const {orderPid,price,createTime} = options
		console.log(createTime);
		orderPid && this.setData({orderPid,price,createTime})
	},
	handlePay: function () {
		const {orderPid,userInfo} = this.data
		if(!orderPid)return
		const _this = this
		wx.request({
			url: API.PAY_TOWXPAY,
			data: {
				orderPid,
				uid: userInfo.uid,
				payType: 2, //2表示支付类型，扫码
				paymentType: 1//1表示自行支付
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this._onWxPay(data);
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	_onWxPay: function (data) {
		const {orderPid}=this.data
		wx.requestPayment({
			"appId": data.appId,
			"nonceStr": data.nonceStr,
			"package": data.package,
			"paySign": data.paySign,
			"signType": data.signType,
			"timeStamp": data.timeStamp,
			success: function (res) {
				console.log('支付成功回调：',res);
				if(res.errMsg == 'requestPayment:ok'){
					return wx.navigateTo({
						url: `/pages/payResult/payResult?type=1&orderPid=${orderPid}`
					});
				}
				return wx.navigateTo({
					url: `/pages/payResult/payResult?type=0&orderPid=${orderPid}`
				});
			},
			fail: function (res) {
				console.log('fail:' + JSON.stringify(res));
				return wx.navigateTo({
					url: `/pages/payResult/payResult?type=0&orderPid=${orderPid}`
				});
			}
		})
	}
})
