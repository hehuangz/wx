//index.js
import util from '../../utils/utils';
import API from '../../constants/apiRoot';
const { dataValidity } = util;

//获取应用实例
const app = getApp()
Page({
	data: {
		openId:''
	},
	getPhoneNumber: function(e) { 	
		wx.login({
			success: function(res){
				console.log('code',res.code);
				console.log('iv:',e.detail.iv) 
				console.log('encryptedData:',e.detail.encryptedData) 
			}
		})
	},
	handleOpenID: function () {
		const _this = this
		wx.login({
			success: function(res){
				if(res.code){
					wx.request({
						url: API.WXPAY_GET_OPENID,
						data: {
							code: res.code
						},
						method: 'POST',
						header: {
						},
						success: function (res2) {
							console.log('获取openId接口返回的数据：',res2);
							const { openId='' }=res2.data
							_this.setData({openId})
						},
						fail: function (res) {
	
						}
					})
				}
			}
		})
	},
	//事件处理函数
	handlePay: function () {
		// let timeStamp = new Date().getTime();
		// let nonceStr=String(Math.random())+String(Math.random())
		// let package='prepay_id=wx'+timeStamp+'_'+Math.random()
		const _this=this
		
		wx.request({
			url: API.WXPAY_TO_PAY,
			method: 'POST',
			data: {
				orderId: '201808030001', /*订单号*/
				price: 0.1, /*订单金额*/
				openid: _this.openid
			},
			success: function (res) {
				console.log('后端成功返回支付所需数据：',res);
				_this._onPay(res)
			},
			fail: function (err) {
			   console.log(err)
			}
		})
		   
	},
	_onPay: function (data) {
		const {
			timeStamp='',
			nonceStr='',
			signType='',
			paySign=''
		} = data;
		wx.requestPayment({
			package: data.package || '',//package是关键字，不能做类名
			timeStamp,
			nonceStr,
			signType,
			paySign,
			success: function (res) {
				console.log(res);
			},
			fail: function (res) {
				console.log('fail:' + JSON.stringify(res));
			}
		  })
	},
	handleAddress: function(){
		wx.chooseAddress({
			success: function (res) {
			  console.log(res.userName)
			  console.log(res.postalCode)
			  console.log(res.provinceName)
			  console.log(res.cityName)
			  console.log(res.countyName)
			  console.log(res.detailInfo)
			  console.log(res.nationalCode)
			  console.log(res.telNumber)
			}
		})
	}
})
