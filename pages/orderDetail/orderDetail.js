//buy.js
import {IMG_OSS_TIAO} from "../../constants/constants"
import API from '../../constants/apiRoot'

Page({
	data: {
		IMG_OSS_TIAO,
		userInfo: {},
		detail: {},
		goods: [],
		status: {
			'0': {
				name: '待支付',
				desc: '剩余付款时间不多矣……',
				icon: 'icon-wallet-nocolor'
			},
			'1': {
				name: '待发货',
				desc: '您的商品正在发货中……',
				icon: 'icon-daifahuo'
			},
			'2': {
				name: '待收货',
				desc1: '请尽快到店领取您的宝贝',//到店取货时的文案
				desc: '商品已发货，物流小哥正在路上……',
				icon: 'icon-daishouhuo'
			},
			'3': {
				name: '交易完成',
				desc: '期待您的再次光临……',
				icon: 'icon-correct'
			},
			'4': {
				name: '交易取消',
				desc: '订单超时或者您已取消该订单……',
				icon: 'icon-close'
			}
		}
	},
	onLoad: function (opts) {
		this.toast=this.selectComponent("#toast")
		this.time=this.selectComponent("#time")
		// 4:15346603062032
		// 1:15343366069854
		const {sn='15343366069854'} = opts
		this.setData({
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}	
		},()=>{
			sn && this._onGetData(sn)
		})
	},
	_onGetData: function (sn) {
		wx.showLoading({
			title: '加载中',
		})
		const {userInfo} = this.data
		console.log()
		const _this = this;
		wx.request({
			url: API.ORDER_DETAIL,
			data: {sn},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({detail:data,goods:data.ordersGoodsList})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
			}
		})
	},
	formatTime:(time)=>{
		return time++
	}
})
