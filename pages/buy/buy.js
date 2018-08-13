//logs.js
import utils from '../../utils/utils.js';
import {IMG_OSS_TIAO} from "../../constants/constants"

Page({
  data: {
    IMG_OSS_TIAO,
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return utils.formatTime(new Date(log))
      })
    })
  }
})
