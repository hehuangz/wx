/**
 * 时间计算器
 * time传入则显示标准时间
 * restTime传入则显示倒计时
 * */
import {formatDate,countDown} from '../../utils/utils'
Component({
    properties: {
        time: {
            type: String,
            value: '',
            observer(val) {
                this.setData({
                    newTime: formatDate(Number(val))
                })
            }        
        },
        restTime: {
            type: String,
            value: '',
            observer(val) {
                this.setData({
                    newRestTime: countDown(val) 
                })
            }
        },
        styles: {
            type: String,
            value: '',
        },
        classes: {
            type: String,
            value: ''
        }
    },
    data:{
       newTime: '',
       newRestTime: ''
    },
    methods:{
        
    }
})