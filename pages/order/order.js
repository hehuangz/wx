//order.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		goodsName: '',
		noData: false,// 搜索结果为空
		tab:[{
			// 0待支付,1待发货,2待收货,3交易完成,4交易取消
			id: '',
			title: '全部'
		}, {
			id: '0',
			title: '待付款'
		}, {
			id: '1',
			title: '待发货'
		}, {
			id: '2',
			title: '待收货'
		}, {
			id: '3',
			title: '已完成'
		}],
		selectedId: '',
		pageSize: 20,
		page: 1,
		noMoreData: false,
		userInfo: {},
		list: [],
		status: {
			'0': '待支付',
			'1': '待发货',
			'2': '待收货',
			'3': '交易完成',
			'4': '交易取消',
		}
	},
	onLoad(){
		this.toast=this.selectComponent("#toast")
	},
	onShow(options){ // url携带的参数，如果携带参数则是从分类进来的
		this.setData({
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		},()=>{
			const {userInfo} = this.data
			if(userInfo.uid){
				this._onGetData()
			}
		})	
	},
	handleTabChange: function (e) {
		const {selectedId} = this.data
		if(e.detail !== selectedId)
		this.setData({selectedId: e.detail},()=>{
			this._onGetData()
		})
	},
	_onGetData: function () {
		const {userInfo,selectedId,goodsName,page,pageSize} = this.data
		wx.showLoading({
			title: '加载中',
		})
		const _this = this;
		wx.request({
			url: API.ORDER_LIST,
			data: {
				uid: userInfo.uid,
				status: selectedId,
				goodsName,
				page,
				pageSize
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({list: data.result})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
				wx.stopPullDownRefresh();
			}
		})
	},
	onPullDownRefresh() {
		this._onGetData();
	},
	/**
	 * 阻止弹框滑动穿透
	 */
	preventD() { },
	_buttonEvent: function() {
		wx.switchTab({url:'/pages/home/home'})
	},
	// 去支付
	handleToPay: function () {
		
	},
	// 取消订单  	
	handleToCancle: function () {
		
	},
	// 删除订单
	handleDelete: function () {

	},
	// 查看订单详情
	handleDetail: function(e) {
		const sn = e.currentTarget.dataset.sn
		wx.navigateTo({url: `/pages/orderDetail/orderDetail?sn=${sn}`})
	}
})
