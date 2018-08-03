/**
 * tab切换组件
 * @param  {String} currentTab 当前选中
 *  */
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        currentTab: {
            type: Number,
            value: 0
        },
        styles: {
            type: String,
            value: ""
        },
        classes: {
            type: String,
            value: ""
        },
        tabTitle: {
            type: Array,
            value: [{id: 0,name:'tab1'},{id: 1,name:'tab2'},{id: 2,name:'tab3'}]
        },
        defaultStyles :{
            type: String,
            value: 'color: #929292'
        },
        selectedStyles :{
            type: String,
            value: 'color: #ff4b2d;border-bottom: 4rpx solid #ff4b2d;'
        }
    },
    data:{
        currentTab: 0
    },
    methods:{
        //滑动切换
        swiperTab: function (e) {
            var that = this;
            that.setData({
                currentTab: e.detail.current
            });
        },
        //点击切换
        clickTab: function (e) {
            var that = this;
            if (this.data.currentTab === e.currentTarget.dataset.current) {
                return false;
            } else {
                that.setData({
                    currentTab: e.currentTarget.dataset.current
                })
            }
        }
    },
    // 父组件，与goods通信
    relations: {
        '../goods/goods': {
          type: 'child', // 关联的目标节点应为父节点
          linked: function(target) {
            // 每次被插入到custom-ul时执行，target是custom-ul节点实例对象，触发在attached生命周期之后
          },
          linkChanged: function(target) {
            // 每次被移动后执行，target是custom-ul节点实例对象，触发在moved生命周期之后
          },
          unlinked: function(target) {
            // 每次被移除时执行，target是custom-ul节点实例对象，触发在detached生命周期之后
          }
        }
      }
    
})