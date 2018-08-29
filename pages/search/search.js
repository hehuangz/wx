//index.js
import API from '../../constants/apiRoot';
import Debounce from '../../utils/debounce'
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
		pageSize: 10,
		pageNum: 1,
		total: null,
		noMoreData: false,
		historyList: [], // ['鞋子','裤子','袜子']
		showHistory: true,
		shopId: null,
		thirdId: null
	},
	onLoad(options){ // url携带的参数，如果携带参数则是从分类进来的
		const {thirdId,shopId} = options
		thirdId && this.setData({
			showHistory:false,
			thirdId
		},()=>{
			this._onGetData({thirdId:thirdId})
		})
	},
	onReady() {
		this.toast=this.selectComponent("#toast")
	},
	onShow() {
		this.setData({
			historyList: wx.getStorageSync('wt_history_label')? wx.getStorageSync('wt_history_label'): [],
			shopId: wx.getStorageSync('wt_shop')? wx.getStorageSync('wt_shop').id:null
		})
	},
	/**
	 * 获取列表，同时兼顾两几种场景，1.单独搜索 2.从分类点击进入
	 */
	_onGetData: function (params={}) {
		wx.showLoading({
			title: '加载中',
		})
		const {more=false,thirdId} = params
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
					if(more){ // 上拉加载时
						if(!(data.dataList && data.dataList.length)) return _this.setData({noMoreData:true}) // 无更多数据时
						return _this.setData({goodsList:[..._this.data.goodsList,...data.dataList],total:data.total})
					}
					return _this.setData({goodsList:data.dataList,total:data.total})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			},
			complete: function () {
				wx.stopPullDownRefresh();
				wx.hideLoading()
			}
		})
	},
	bindKeyWords: function (e) {
		this.setData({keyWords:e.detail.value})
	},
	handleCategory: function (e) {
		Debounce(()=>{
			this.setData({
				searcheCondtion: e.currentTarget.dataset.current,
				pageNum:1
			},()=>{
				this._onGetData({thirdId:this.data.thirdId})
			})
		})
	},
	handleSearch: function () {
		Debounce(()=>{
			const {keyWords=''} = this.data
			// 点击搜索，页数归1，隐藏历史搜索，搜索加入缓存
			this.setData({
				pageNum: 1,
				showHistory: false,
				thirdId: null
			},()=>{
				this._onGetData()
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
	},
	onPullDownRefresh() {
		let {showHistory}=this.data
		if(showHistory){
			return wx.stopPullDownRefresh();
		}
		this.setData({pageNum:1},()=>{
			this._onGetData();
		})
	},
	onReachBottom() {
		let {pageNum,total,pageSize} = this.data
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
			this._onGetData({more:true});
		})
	},
})
