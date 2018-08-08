/**
 * goods商品卡片
 * @param  {String} styles 行内样式
 * @param  {String} classes 类名
 *  */
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        styles: {
            type: String,
            value: ""
        },
        classes: {
            type: String,
            value: ""
        },
        title: {
            type: String,
            value: "标题"
        },
        src: {
            type: String,
            value: ""
        },
        price: {
            type: String,
            value: "100"
        },
        oldPrice: {
            type: String,
            value: "100"
        }
    },
    data:{
    },
    methods:{
    },
    relations: {
        '../tab/tab': {
          type: 'parent', // 关联的目标节点应为子节点
          linked: function(target) {
            // 每次有custom-li被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
          },
          linkChanged: function(target) {
            // 每次有custom-li被移动后执行，target是该节点实例对象，触发在该节点moved生命周期之后
          },
          unlinked: function(target) {
            // 每次有custom-li被移除时执行，target是该节点实例对象，触发在该节点detached生命周期之后
          }
        }
      },
})