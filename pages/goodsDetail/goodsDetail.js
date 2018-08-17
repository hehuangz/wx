//logs.js
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
		userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		goodId: null,
		shopInfo: wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{},
		skuDesc: '',
		address: '',
		source: 0,//扫描进来的时候，如果是1，则加入购物车和立即购买时携带1过去
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		let {goodId=null,source=0} = options
		// 设置方式
		this.setData({source})

		let {adviser} = this.data
		let wt_counselor=wx.getStorageSync('wt_counselor')?wx.getStorageSync('wt_counselor'):{}
		if(wt_counselor.uid) {
			adviser={uid:wt_counselor.uid,name:wt_counselor.name}
		}
		this.setData({
			goodId,
			adviser
		})
		this._onGetData(goodId)
		this._onGetShopAddress()
	},
	// 生命周期-页面显示即调用，因为ready和load方法在返回路由时不调用
	onShow: function(){
		// 只要显示先设置下title
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
	},
	// 获取数据
	_onGetData: function(goodId){
		wx.showLoading({
			title: '加载中',
		})
		const _this=this
		wx.request({
			url: API.GOODS_DETAIL,
			data: {
				goodId: goodId || 68 // --TEMP--
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({data,skuArr:data.skuArr})
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
		const {shopInfo} = this.data
		const {id} = shopInfo
		wx.navigateTo({
			url: `/pages/adviser/adviser?shopId=${id}`
		})
	},
	// 加入购物车
	handleToCart: function () {
		const {adviser={},userInfo={},skuInfo={},goodId,stepperValue,shopInfo,skuDesc,source}=this.data
		if(!skuInfo.stock)return this.handleChooseSku() //未选择规格，让它去选
 		const _this=this
		wx.request({
			url: API.CART_INSERT,
			data:{
				counselorId: adviser.uid || 8,//--TEMP--
				goodsId: goodId || 68,//--TEMP--
				number: stepperValue,
				shopId: shopInfo.id,
				skuDesc: skuDesc,
				skuId: skuInfo.skuId,
				uid: userInfo.uid,
				source,  //0是线上(默认)，1是线下，扫码进来链接带的参数 --TEMP--
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
							// let page=getCurrentPages().pop()
							// if(!page)return
							// page.onLoad()
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
	 */
	_onGetShopAddress: function () {
		const {shopInfo} = this.data
		const _this=this
		wx.request({
			url: API.HOME_SHOP_ADDRESS,
			data: {
				shopId:shopInfo.id
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					let address=data.address || ''
					return _this.setData({address})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	// 立即购买
	handleBuy: function () {
		const {skuInfo={},userInfo} = this.data

		// 验证是否登录
		if(!userInfo.uid){
			return wx.showModal({
				title: '提示',
				content: '绑定手机号才能下单哦～，绑定？',
				success: function(res) {
				  if (res.confirm) {
					 wx.switchTab({
						 url: '/pages/mine/mine?showDialog=1'
					 })
				  } else if (res.cancel) {
					console.log('用户点击取消')
				  }
				}
			  })  
		}
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
			source, //0是线上(默认)，1是线下，扫码进来链接带的参数 --TEMP--
		}]
		// 显示数据
		
		let toBuyData={
			type: 1,// 1:直接购买 2:购物车到购买
			ordersGoods,
			show:{
				shopName: shopInfo.shopName,
				counselorName:adviser.name,
				image:skuInfo.image,
				name:data.name,
				skuDesc,
				price:skuInfo.price,
				marketPrice:data.marketPrice,
				number:stepperValue
			},
			priceTotal: Number(skuInfo.price)*stepperValue,
			marketPriceTotal: Number(data.marketPrice)*stepperValue
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
		const {goodId} = this.data
		console.log(goodId,res);
		if (res.from === 'button') {
			// 来自页面内转发按钮
			console.log(res.target)
		}
		return {
			title: '这个东西不错',
			path: `/page/goodsDetail/goodsdetail?goodId=${goodId}`
		}
	}
})
