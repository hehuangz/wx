/**
 * toast弹窗
 * @param  {String} icon icon
 * @param  {String} title title
 * @param  {Boolean} refresh  是否可刷新
 *  */
Component({
    properties: {
        refresh:{
            type: Boolean,
            value: 1 
        },
        icon: {
            type: String,
            value: 'icon-shouji'
        },
        title:{
            type: String,
            value: '当前网络不稳定，请刷新重试'
        }
    },
    data:{
        
    },
    methods:{
    }
})