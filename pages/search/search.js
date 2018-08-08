//index.js
import API from '../../constants/apiRoot';

//获取应用实例
const app = getApp()
Page({
	data: {
		keyWords: '',
		noData: false,// 搜索结果为空
		searcheCondtion: 1,
		// 搜索排序状态（1：按照销量 ，2 价格由低到高 3 价格由高到低
		categoryList:[{
			id: 1,
			name: "销量",
			icon: "icon-sale",
			searcheCondtion: 1
		},{
			id: 2,
			name: "价格低到高",
			icon: "icon-low-to-high",
			searcheCondtion: 2
		},{
			id:  3,
			name: "价格高到低",
			icon: "icon-high-to-low",
			searcheCondtion: 3
		}],
		goodsList: [],
		pageSize: 20,
		pageNum: 1,
		noMoreData: false,
		historyList: wx.getStorageSync('wt_history_label')? wx.getStorageSync('wt_history_label'): [], // ['鞋子','裤子','袜子']
		showHistory: true,
		shopId: wx.getStorageSync('wt_shop')? wx.getStorageSync('wt_shop').id:null,
		thirdId: null
	},
	onLoad(options){ // url携带的参数，如果携带参数则是从分类进来的
		const {thirdId,shopId} = options
		thirdId && this.setData({
			showHistory:false,
			thirdId
		},()=>{
			this._onGetList({thirdId:thirdId})
		})
	},
	onReady() {
		this.toast=this.selectComponent("#toast")
		const {keyWords,searcheCondtion} = this.data;
	},
	/**
	 * 获取列表，同时兼顾两几种场景，1.单独搜索 2.从分类点击进入
	 */
	_onGetList: function (params={}) {
		const {toLower=false,thirdId} = params
		const {keyWords,searcheCondtion,pageSize,pageNum,shopId} = this.data
		const url=thirdId?API.SEARCH_GOODS_BYSHIRDID:API.SEARCH_GOODS
		const temp=thirdId?{thirdId}:{keyWords:keyWords && keyWords.trim()}
		const _this=this
		wx.request({
			url,
			data: {...temp,searcheCondtion,pageSize,pageNum,shopId},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded" //如果需要formdata格式的数据，加之
			},
			success: function (res) {
				const {code='', data=[], message=''} = res.data
				if( code===200 ){
					if(toLower){ // 上拉加载时
						if(!(data.dataList && data.dataList.length)) return _this.setData({noMoreData:true}) // 无更多数据时
						return _this.setData({goodsList:[..._this.data.goodsList,...data.dataList]})
					}
					return _this.setData({goodsList:data.dataList})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	bindKeyWords: function (e) {
		this.setData({keyWords:e.detail.value})
	},
	handleCategory: function (e) {
		this.setData({
			searcheCondtion: e.currentTarget.dataset.current,
			pageNum:1
		},()=>{
			this._onGetList({thirdId:this.data.thirdId})
		})
	},
	handleSearch: function () {
		const {keyWords=''} = this.data
		// 点击搜索，页数归1，隐藏历史搜索，搜索加入缓存
		this.setData({
			pageNum:1,
			showHistory: false,
			thirdId: null
		},()=>{
			this._onGetList()
			let old=wx.getStorageSync('wt_history_label')? wx.getStorageSync('wt_history_label'): [];
			if(keyWords.trim() && (old.indexOf(keyWords)==-1)){
				const data=[keyWords,...old].slice(0,12)
				wx.setStorage({
					key: "wt_history_label",
					data,
					success:function () {
					}
				})
			}
		})
	},
	/**
	 * 滑动到底部
	 */
	handleScrollLower: function (e) {
		this.setData({
			pageNum:this.data.pageNum+1
		},()=>{
			this._onGetList({toLower:true})
		})
	},
	/**
	 * 	清空历史搜索
	 */
	handleClear: function () {
		this.setData({
			historyList: []
		},()=>{
			wx.removeStorage({key: 'wt_history_label'})
		})
	},
	/**
	 *  点击标签进行搜索
	 */
	handleLabel: function (e) {
		let keyWords=e.currentTarget.dataset.value;
		this.setData({
			keyWords,
			showHistory: false
		})
	}
})
