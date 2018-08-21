//order.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		goodsName: '',
		noData: false,// 搜索结果为空
		tab:[{// 0待支付,1待发货,2待收货,3交易完成,4交易取消
			id: '',
			title: '全部'
		}, {
			id: '0',
			title: '待支付'
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
		pageSize: 10,
		page: 1,
		noMoreData: false,
		userInfo: {},
		list: [],
		totalSize: '',
		status: {
			'0': '待支付',
			'1': '待发货',
			'2': '待收货',
			'3': '交易完成',
			'4': '交易取消',
		}
	},
	onLoad(opts){
		const {selectedId=''}=opts
		this.setData({selectedId})
		this.toast=this.selectComponent("#toast")
	},
	onShow(options){ // url携带的参数，如果携带参数则是从分类进来的
		this.setData({
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
			goodsName: ''
		},()=>{
			const {userInfo} = this.data
			if(userInfo.uid){
				this._onGetData()
			}
		})	
	},
	bindGoodsName: function (e) {
		this.setData({goodsName:e.detail.value})
	},
	handleSearch: function () {
		this.setData({page:1},()=>{
			this._onGetData()
		})
	},
	handleTabChange: function (e) {
		const {selectedId} = this.data
		if(e.detail !== selectedId)
		this.setData({selectedId: e.detail,page:1},()=>{
			this._onGetData()
		})
	},
	_onGetData: function (more=false) {
		const {userInfo,selectedId,goodsName,page,pageSize} = this.data
		let oldList=[]
		if(more){
			oldList=this.data.list
		}
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
					return _this.setData({list: [...oldList,...data.result],totalSize:data.totalSize})
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
		this.setData({page:1},()=>{
			this._onGetData();
		})
	},
	onReachBottom() {
		let {page,totalSize,pageSize} = this.data
		if(Math.ceil(totalSize/pageSize)<=page){
			return wx.showToast({
				title: '无数据，不要再拉我了～',
				icon: 'none',
				duration: 1000
			})	   
		}
		this.setData({
			page: page+1
		},()=>{
			this._onGetData(true);
		})
	},
	/**
	 * 阻止弹框滑动穿透
	 */
	preventD() { },
	// 无订单时去逛逛首页
	_buttonEvent: function() {
		wx.switchTab({url:'/pages/home/home'})
	},
	// 去支付
	handleToPay: function (e) {
		const orderPid=e.currentTarget.dataset.orderpid
		const price=e.currentTarget.dataset.price
		const createTime=e.currentTarget.dataset.createtime
		wx.navigateTo({
			url:`/pages/pay/pay?orderPid=${orderPid}&price=${price}&createTime=${createTime}`
		})
	},
	// 取消订单
	handleToCancle: function (e) {
		const {userInfo} = this.data
		const sn = e.currentTarget.dataset.sn
		const _this = this;
		wx.showModal({
			title: '提示',
			content: '确定取消该订单吗?',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading({
						title: '加载中',
					})
					wx.request({
						url: API.ORDER_CANCLE,
						data: {sn},
						method: 'POST',
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							"token": userInfo.token
						},
						success: function (res) {
							const {code='', data={}, message=''} = res.data
							if( code===200 ){
								_this._onGetData()
								return wx.showToast({
									title: '操作成功',
									icon: 'none',
									duration: 2000
								})	  
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
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}			
		})
	},
	// 删除订单
	handleDelete: function (e) {
		const {userInfo} = this.data
		const sn = e.currentTarget.dataset.sn
		const _this = this;
		wx.showModal({
			title: '提示',
			content: '确定删除该订单吗?',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading({
						title: '加载中',
					})
					wx.request({
						url: API.ORDER_DETELE,
						data: {sn},
						method: 'POST',
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							"token": userInfo.token
						},
						success: function (res) {
							const {code='', data={}, message=''} = res.data
							if( code===200 ){
								_this._onGetData()
								return wx.showToast({
									title: '操作成功',
									icon: 'none',
									duration: 2000
								})	  
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
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}			
		})
	},
	// 确认收获
	handleGetGoods: function (e) {		
		const {userInfo} = this.data
		const sn = e.currentTarget.dataset.sn
		const _this = this;
		wx.showModal({
			title: '提示',
			content: '确定收到该宝贝了吗?',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading({
						title: '加载中',
					})
					wx.request({
						url: API.ORDER_GETGOODS,
						data: {sn},
						method: 'POST',
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							"token": userInfo.token
						},
						success: function (res) {
							const {code='', data={}, message=''} = res.data
							if( code===200 ){
								_this._onGetData()
								return wx.showToast({
									title: '操作成功',
									icon: 'none',
									duration: 2000
								})	  
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
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}			
		})
	},
	// 查看订单详情
	handleDetail: function(e) {
		const sn = e.currentTarget.dataset.sn
		wx.navigateTo({url: `/pages/orderDetail/orderDetail?sn=${sn}`})
	},
	handleLogistics: function (e) {
		const sn = e.currentTarget.dataset.sn
		wx.navigateTo({url: `/pages/logistics/logistics?sn=${sn}`})
	}
})
