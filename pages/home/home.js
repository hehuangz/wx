//honme.js
import API from '../../constants/apiRoot';
import {getQuery} from '../../utils/utils';
import Promise from '../../utils/promise';
//获取应用实例
const app = getApp()

Page({
	data: {
		currentTab: '',
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		shop: {},
		counselorData: {img:'',name:'网吧'}, // 顾问列表
		categoryList: [], // 分类列表
		goodsList: [],
		errorPage: false,
		pageSize: 20,
		pageNum: 1,
		total: null,
		userInfo: {},
		counselorInfo: {},
		isForce: 0
	},
	onLoad: function (){
		this.dialog=this.selectComponent("#dialog")
		this.toast=this.selectComponent("#toast")
		/**
		 * 获取定位信息
		 */
		this._onLocation()
		/**
		 * 获取一级分类
		 */
		this._onGetCategory()
		/**
		 * 没有授权没有拿到微信头像时打开弹窗
		 */
		this._onWxUser()
	},
	/**
	 * 显示时判断是否切换店铺，以本地为准
	 */
	onShow: function () {
		// 本地数据与现在data中不一致就本地覆盖data，以本地为准
		let local_shop = wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
		local_shop.id && wx.setNavigationBarTitle({
			title: local_shop.shopName
		})
		this.setData({
			shop: local_shop,
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
			counselorInfo: wx.getStorageSync('wt_counselor')?wx.getStorageSync('wt_counselor'):{}
		},()=>{
			this._onGetCategory()
			this._onGetAdviser()
		})	
	},
	_onLocation: function () {
		const local_shop = wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
		if(local_shop.id){
			return;
		}
		const _this=this
		wx.showLoading({
			title: '加载中',
		})
		// 本地无数据再去获取地理位置
		wx.getLocation({
			type: 'wgs84', // 默认该类型
			success: function(res) {
				wx.request({
					url: API.HOME_NEARLY_SHOP,
					data: {
						latitude: res.latitude,
						longitude: res.longitude
					},
					method: 'POST',
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					success: function (res) {
						const {code, data, message} = res.data
						if( code===200 ){
							wx.setStorage({
								key: "wt_shop",
								data
							})
							return _this.setData({shop:data},()=>{
								/**
								 * 获取顾问列表
								 */
								_this._onGetAdviser()
								/**
								 * 获取一级分类
								 */
								_this._onGetCategory()
							})
						}else{
							this.setData({errorPage:true})
							return _this.toast.warning(message)
						}
					},
					fail: function (res) {
						return _this.toast.error('请求失败，请刷新重试')
					},
					complete: function () {
						wx.hideLoading()
					}
				})
			}
		})
	},
	_onWxUser: function () {
		if(!wx.getStorageSync('wx_user') && !wx.getStorageSync('wt_user')){
			this.dialog.showDialog()
			const _this=this;
			wx.getSetting({
				success: function(res){
					if (res.authSetting['scope.userInfo']) {
						// 已经授权，可以直接调用 getUserInfo 获取头像昵称
						wx.getUserInfo({
							success: function(res) {
								wx.setStorage({
									key:"wx_user",
									data:res.userInfo
								})
							}
						})
					}
				}
			})
		}
	},
	// 获取用户头像等
	getUserInfo: function(e){
		wx.setStorage({
			key:"wx_user",
			data:e.detail.userInfo
		})
		this.dialog.hideDialog();
	},
	//点击切换
	handleCategory: function (e) {
		if (this.data.currentTab === e.currentTarget.dataset.current) {
			return false;
		} else {
			this.setData({
				currentTab: e.currentTarget.dataset.current,
				pageNum: 1
			},()=>{
				this._onGetGoods()
			})
		}
	},
	// 去搜索页面
	handleSearch: function () {
		wx.navigateTo({url:'/pages/search/search'})
	},
	/**
	 * 获取顾问列表
	 */
	_onGetAdviser: function () {
		const {shop={}} = this.data;
		const _this = this;
		const userInfo = wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		if(!shop.id){
			return
		}
		wx.showLoading({title:'加载中'})		
		wx.request({
			url: API.HOME_ADVISER_USER,
			data: {
				shopId: shop.id,
				uid: userInfo.uid
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					// __TEMP
					return _this.setData({
						counselorData:data,
						isForce:data.isForce
					},()=>{
						wx.setStorageSync('wt_counselor',{
							uid: data.uid,
							name: data.name,
							isForce: data.isForce
						})
						//在扫顾问二维码跳转到商品详情时使用的primise
						_this.resolve && _this.resolve() 
					})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
			}
		})
	},
	/**
	 * 获取一级分类
	 */
	_onGetCategory: function () {
		const {shop} = this.data
		const _this = this;
		shop.id && wx.request({
			url: API.HOME_CATEGORY_FIRST,
			data: {
				shopId: shop.id
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				const {code, data=[], message} = res.data
				if( code===200 ){
					if(!data.length)return
					return _this.setData({categoryList:data,currentTab:data[0] && data[0].id,pageNum:1},()=>{
						_this._onGetGoods()
					})
				}
				return _this.toast.warn(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	/**
	 * 获取分类下的商品
	 */
	_onGetGoods: function (more=false) {
		wx.showLoading({
			title: '加载中',
		})
		const {pageSize,pageNum,shop,currentTab,goodsList}=this.data
		let oldList=[]
		if(more){
			oldList=goodsList
		}
		const _this = this;
		shop.id && wx.request({
			url: API.HOME_COODS,
			data: {
				shopId: shop.id, 
				firstId: currentTab,
				pageSize,
				pageNum
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				const {code, data={}, message} = res.data
				if( code===200 ){
					return _this.setData({goodsList:[...oldList,...data.dataList],total:data.total})
				}
				return _this.toast.warn(message)
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
	//dialog取消事件
	_cancelEvent(){
		this.dialog.hideDialog();
	},
	//dialog确认事件
	_confirmEvent(){
		this.dialog.hideDialog();
	},
	// 无网络时，点击立即刷新按钮
	_buttonEvent() {
		this.onLoad()
	},
	/**
	 * 扫一扫按钮
	 */
	handleSao: function () {
		wx.scanCode({
			success: (res) => {
				//商品：https://app.wutonglife.com/detail?shopId=45&id=254&shopName=A1-B类型&source=1&isApp=
				//顾问：https://app.wutonglife.com?shopId=57&assistantId=107&shopName=附近测试店铺
				if(res.errMsg="scanCode:ok"){
					const {result} = res
					let shopId=getQuery('shopId',result)
					let shopName=getQuery('shopName',result)
					let id=getQuery('id',result)//商品id
					let source=getQuery('source',result)
					let assistantId=getQuery('assistantId',result)
					// console.log(shopId,shopName,id,source,assistantId);
					if(!shopId) {
						return this.toast.warn('店铺不存在')
					}else if (shopId && id) { //商品，进入商品详情，并且切换店铺 --TEMP--不切换顾问吗
						this._onSaoGoods({shopId,shopName,id,source})
					}else if (shopId && assistantId) {// 扫描的是顾问二维码，进入顾问
						this._onSaoAdviser({shopId,shopName,assistantId})
					}
				}
			}
		})		  
	},
	/**
	 * 扫商品码进入的链接，跳转到商品详情，切换到该店铺和该顾问
	 */
	_onSaoGoods: function (opts) {
		const {shopId='',shopName='',id='',source=''} = opts
		const _this=this
		this.setData({
			shop:{id:shopId,shopName}
		},()=>{
			//先设置本地，获取_onGetAdviser列表，将第一个设置为默认顾问，然后跳转到顾问列表
			wx.setStorageSync('wt_shop',{id: shopId,shopName})
			new Promise(function(resolve,reject){
				_this.resolve=resolve
				_this._onGetAdviser()
			}).then(()=>{
				wx.navigateTo({
					url: `/pages/goodsDetail/goodsDetail?goodId=${id}&source=${source}`,
					success: function () {
						// 使下一页load()
						let page=getCurrentPages().pop()
						if(!page)return
						page.onLoad()
					}
				})
			})
		})
	},
	_onSaoAdviser: function (opts) {
		const {shopId='',shopName='',assistantId=''} = opts
		const _this=this
		wx.setStorage({
			key: "wt_shop",
			data: {
				id: shopId,
				shopName: shopName
			},
			success: function (){
				_this.onShow()
			}
		})
	},
	onPullDownRefresh() {
		this.setData({pageNum:1},()=>{
			this._onGetGoods();
		})
	},
	onReachBottom() {
		let {total,pageNum,pageSize} = this.data
		if(Math.ceil(total/pageSize)<=pageNum){
			return 
			// wx.showToast({
			// 	title: '无数据，不要再拉我了～',
			// 	icon: 'none',
			// 	duration: 1000
			// })	   
		}
		this.setData({
			pageNum: pageNum+1
		},()=>{
			this._onGetGoods(true);
		})
	},
	handlePreviewImg: function (e) {
		const img=e.currentTarget.dataset.img
		wx.previewImage({
			current: img, // 当前显示图片的http链接
			urls: [img] // 需要预览的图片http链接列表
		  })
	},
	handleToAsk: function () {
		wx.navigateTo({
			url: '/pages/download/download'
		})
	},
	// 滑动切换
	handleToList: function (e) {
		const {shop={}} = this.data;
		const counselorId=wx.getStorageSync('wt_counselor')?wx.getStorageSync('wt_counselor').uid:null
		const isForce=wx.getStorageSync('wt_counselor')?wx.getStorageSync('wt_counselor').isForce:0
		wx.navigateTo({
			url: `/pages/counselor/counselor?shopId=${shop.id}&cid=${counselorId}&isForce=${isForce}`
		})
	}
})
