//goodsDetail.js
import API from '../../constants/apiRoot'

Page({
	data: {
		data:{},
		showsku: false, // 显示sku层
		stepperValue: 1,
		skuArr: [], // 后端返回的skuArr
		skuData: {}, // {'hh':{value:['red','yellow'],active:'red'}}
		skuSelect: {}, // 当前选中的sku组合{"color":"red","weight":"300g"}
		skuInfo: {}, // 当前选中的整条商品信息，包括价格图片库存，skuArr中的一条
		adviser: {uid:'',name:''},
		// 下面的数据只是加入购物车或立即购买时使用
		userInfo: {},
		goodId: null,
		shopInfo: {},
		skuDesc: '',
		address: '',
		source: 0,// 扫描进来的时候，如果是1，则加入购物车和立即购买时携带1过去
		share: {} // 点击好友分享到小程序进来
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		let {goodId=null,source=0,uid,gid,gname} = options
		console.log('链接参数',options)
		// 设置方式
		let {adviser} = this.data
		if(gid && gname){ // 分享中进入
			adviser={uid:gid,name:gname}
			this.setData({share:{uid,gid}})
		}else {
			let wt_counselor=wx.getStorageSync('wt_counselor')?wx.getStorageSync('wt_counselor'):{}
			if(wt_counselor.uid) {
				adviser={uid:wt_counselor.uid,name:wt_counselor.name}
			}
		}
		this.setData({
			source,
			goodId,
			adviser,
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
			shopInfo: wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
		})
		this._onGetData(options)
	},
	// 生命周期-页面显示即调用，因为ready和load方法在返回路由时不调用
	onShow: function(){
		// 只要显示先设置下title
		const _this = this
		let local_shop = wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
		local_shop.id && wx.setNavigationBarTitle({
			title: local_shop.shopName 
		})
		// 选顾问时，选好返回上一页
		const pages=getCurrentPages()
		let currentPage=pages[pages.length-1]
		let adviser = currentPage.data.adviser
		adviser && this.setData({
			adviser:currentPage.data.adviser
		})
		const {userInfo} = this.data
		let wt_user=wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		if(wt_user.uid && userInfo.uid!=wt_user.uid){
			this.setData({userInfo:wt_user})
		}
		wx.login({
			success: function(wxres){
				// 存储jscode
				_this._onJscode(wxres)
			}
		})
	},
	// 绑定openId，sessionKey
	_onJscode: function (wxres) {
		wx.request({
			url: API.MINE_JSCODE, // ADVISER_SHOP_LIST
			data: {
				jscode: wxres.code
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
			},
			fail: function (res) {
			}
		})
	},
	// 获取数据
	_onGetData: function(options){
		const {goodId,uid,counselorId,shopId,userId} = options // 用于数据采集使用
		const userInfo = wx.getStorageSync('wt_user') ? wx.getStorageSync('wt_user') : {}
		wx.showLoading({
			title: '加载中',
		})
		const _this=this
		goodId && wx.request({
			url: API.GOODS_DETAIL,
			data: {
				goodId,
				uid: userId || userInfo.uid ||  0, // uid/counselorId/shopId用于做数据统计
				counselorId:counselorId || null,
				shopId: shopId || 0
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					_this._onGetShopInfo(data.shopId)
					return _this.setData({
						data,
						skuArr: data.skuArr,
						address: data.shopAddress
					})
				}
				return _this.toast.warning(message || '请求失败')
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.hideLoading()
			}
		})
	},
	// 根据shopId获取店铺详细数据
	_onGetShopInfo: function (shopId) {
		const _this = this
		shopId && wx.request({
			url: API.COMMON_SHOPINFO,
			data: {
				shopId
			},
			method: 'POST',
			header: {},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return  _this.setData({
						shopInfo: {id:shopId,shopName: data.shopName}
					},()=>{
						wx.setStorageSync('wt_shop',{
							id: shopId,
							shopName: data.shopName
						})
					})
				}
				return _this.toast.warning(message || '请求失败')
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	// 点击出来sku-popup
	handleChooseSku: function() {
		this.setData({showsku:true},()=>{
			this._onGetSkuKey()
		})
	},
	// 控制popup
	togglePopup() {
		this.setData({
			showsku: !this.data.showsku
		});
	},
	// 控制计数器
	handleZanStepperChange({detail: stepperValue}) {
		// stepper 代表操作后，应该要展示的数字，需要设置到数据对象里，才会更新页面展示
		this.setData({
			'stepperValue': stepperValue
		});
	},
	// 组织wxml需要的数据格式,设置默认的sku组合
	_onGetSkuKey: function () {
		const {skuArr,skuData,skuSelect} = this.data;
		skuArr.map((item)=>{
			let value=JSON.parse(item.value)
			for (const key in value) {
				if(!skuData[key]){ // key不存在时给默认值
					skuData[key]={value:[],active:value[key]}
					skuSelect[key]=value[key]
				}
				if(skuData[key]['value'].indexOf(value[key])==-1){
					skuData[key]['value'].push(value[key])
				}
			}
		})
		this.setData({skuData,skuSelect},()=>{
			this._onGetSkuInfo()
		})
	},
	// 点击标签切换sku属性
	handleTabLabel: function (e) {
		const {active,name} = e.currentTarget.dataset;
		const {skuArr,skuSelect,skuData} = this.data;
		// label切换
		for (const key in skuData) {
			if(key==name && skuData[key].active!=active){
				skuData[key].active=active;
				skuSelect[key]=active
			}else if(key==name && skuData[key].active===active){ //重复点击则返回
				return false
			}
		}
		this.handleZanStepperChange({detail:1}) //label切换计数器归1 
		this.setData({skuData,skuSelect},()=>{
			this._onGetSkuInfo()
		})
	},
	// 拿到当前选中的sku对应的商品信息
	_onGetSkuInfo: function () {
		const {skuArr,skuSelect,skuData} = this.data;
		let skuInfo = this.data.skuInfo
		// 赋值当前sku对应的产品
		skuInfo=skuArr.filter((item)=>{
			let value=JSON.parse(item.value)
			let flag=true
			for (const key in skuSelect) {
				if(value[key] && value[key]!=skuSelect[key]){flag=false}
			}
			if(flag) return true
		})
		if(skuInfo[0] && skuInfo[0].stock && skuInfo[0].stock<=0)return this.toast.warn('库存不足')
		this.setData({skuInfo:skuInfo[0]},()=>{
			this._onGetSkuDesc()
		})
	},
	// 获取选择sku之后显示skuDesc
	_onGetSkuDesc: function () {
		let {skuDesc='',skuInfo={}} = this.data
		skuDesc=''
		const skuDesc_obj=skuInfo.value?JSON.parse(skuInfo.value):{}
		for (const key in skuDesc_obj) {
			skuDesc+=skuDesc_obj[key]+' '
		}
		this.setData({skuDesc})
	},
	// 更换顾问
	handleChangeAdviser: function(){
		// 点顾问名字，进入顾问列表
		// 如果是分享进入的，分享的顾问gid与本地已经存储的顾问id是同一个人，则用本地的isForce 
		const {shopInfo,adviser} = this.data
		const wt_counselor=wx.getStorageSync('wt_counselor')?wx.getStorageSync('wt_counselor'):{}
		let isForce = 0
		if(wt_counselor.isForce && wt_counselor.uid == adviser.uid){
			isForce = wt_counselor.isForce || 0
		}
		wx.navigateTo({
			url: `/pages/counselor/counselor?shopId=${shopInfo.id}&cid=${adviser.uid}&isForce=${isForce}`
		})
	},
	// 加入购物车
	handleToCart: function () {
		const {adviser={},userInfo={},skuInfo={},goodId,stepperValue,shopInfo,skuDesc,source}=this.data
		if(!userInfo.uid)return
		if(!skuInfo.stock)return this.handleChooseSku() //未选择规格，让它去选
		const _this=this
		goodId && wx.request({
			url: API.CART_INSERT,
			data:{
				counselorId: adviser.uid,
				goodsId: goodId,
				number: stepperValue,
				shopId: shopInfo.id,
				skuDesc: skuDesc,
				skuId: skuInfo.skuId,
				uid: userInfo.uid,
				source,  //0是线上(默认)，1是线下，扫码进来链接带的参数
			},
			method: 'POST',
			header: {
				"token":userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return wx.switchTab({
						url:'/pages/cart/cart',
						success: function(){
							let page=getCurrentPages().pop()
							if(!page)return
							page.onLoad()
						}
					})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	/**
	 * 获取店铺地址,主要是在立即购买的时候用到
	 * 商品详情后端接口返回shopAddress，所以不用自己请求了
	 */
	// _onGetShopAddress: function () {
	// 	const {shopInfo} = this.data
	// 	const _this=this
	// 	shopInfo.id && wx.request({
	// 		url: API.HOME_SHOP_ADDRESS,
	// 		data: {
	// 			shopId: shopInfo.id
	// 		},
	// 		method: 'POST',
	// 		header: {
	// 		},
	// 		success: function (res) {
	// 			const {code='', data={}, message=''} = res.data
	// 			if( code===200 ){
	// 				let address=data.address || ''
	// 				return _this.setData({address})
	// 			}
	// 			return _this.toast.warning(message)
	// 		},
	// 		fail: function (res) {
	// 			return _this.toast.error('请求失败，请刷新重试')
	// 		}
	// 	})
	// },
	// 立即购买
	handleBuy: function () {
		const {skuInfo={},userInfo} = this.data
		if(!userInfo.uid) return
		// 验证规格，未选择规格，让它去选
		if(!skuInfo.stock)return this.handleChooseSku()
		
		// 验证都通过，开始发数据，订单数据
		const {data,adviser,goodId,stepperValue,shopInfo,skuDesc,address,source}=this.data
		let ordersGoods=[{
			counselorId: adviser.uid || 8,
			goodsId: goodId || 68,
			number: stepperValue,
			shopAddress: address,
			shopId: shopInfo.id,
			skuDesc: skuDesc,
			skuId: skuInfo.skuId,
			source, //0是线上(默认)，1是线下，扫码进来链接带的参数
		}]
		// 显示数据
		let toBuyData={
			type: 1,// 1:直接购买 2:购物车到购买
			ordersGoods,
			show:{
				shopName: shopInfo.shopName,
				counselorName: adviser.name,
				image: skuInfo.image,
				name: data.name,
				skuDesc,
				price: skuInfo.price,
				marketPrice: data.marketPrice,
				number:stepperValue,
				regionLimit: data.regionLimit,
				limitArea: data.limitArea
			},
			showArr:[{shopAddress: address}],
			priceTotal: (Number(skuInfo.price)*stepperValue).toFixed(2),
			marketPriceTotal: (Number(data.marketPrice)*stepperValue).toFixed(2)
		}
		wx.setStorage({
			key: "wt_toBuy",
			data: toBuyData,
			success:function () {
				wx.navigateTo({
					url:'/pages/buy/buy'
				})
			}
		})
	},
	onShareAppMessage: function (res) {
		const {goodId,data={},userInfo,adviser} = this.data
		if (res.from === 'button') {
			// 来自页面内转发按钮
			console.log(res.target)
		}
		return {
			title: data.name || '我发现了一件不错的宝贝',
			path: `/pages/goodsDetail/goodsDetail?goodId=${goodId}&uid=${userInfo.uid}&gid=${adviser.uid}&gname=${adviser.name}`,
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		}
	},
	handleWxTel: function (e) {
		const _this=this
		if(e.detail.errMsg!="getPhoneNumber:ok"){
			return
		}
		wx.login({
			success: function (wxres) {
				_this.getPhoneNumber(e, wxres)
			}
		})
	},
	getPhoneNumber: function (_e, wxres) {
		const {share} = this.data
		let userInfo=wx.getStorageSync('wx_user')?wx.getStorageSync('wx_user'):{}
		let shopInfo=wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
		const _this=this
		wx.request({
			url: API.MINE_WXTEL,// ADVISER_SHOP_LIST
			data: {
				iv: _e.detail.iv,
				encryptedData: _e.detail.encryptedData,
				jscode: wxres.code,
				img: userInfo.avatarUrl || null,
				nickname:  userInfo.nickName || null,
				uid: share.uid || null,
				gid: share.gid || null,
				sid: shopInfo.id || null
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				const {code='', data={}, message=""} = res.data
				if( code===200 && data){
					return  _this.setData({
						userInfo: data
					},()=>{
						wx.setStorage({
							key: "wt_user",
							data,
							success:function () {
								_this.toast.success("绑定成功")
							}
						})
					})
				}
				return _this.toast.warning('绑定失败，请稍后重试')
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	handlePreviewImg: function (e) {
		const {data} = this.data
		const img=e.currentTarget.dataset.img
		wx.previewImage({
			current: img, // 当前显示图片的http链接
			urls: data.images // 需要预览的图片http链接列表
		})
	},
	handleToHome: function () {
		wx.switchTab({url:'/pages/home/home'})
	}
})