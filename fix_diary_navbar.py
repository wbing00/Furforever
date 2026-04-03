# -*- coding: utf-8 -*-
import io
d=io.open('d:/FurForever/miniprogram/pages/diary/index.wxml','r',encoding='utf-8').read()
d=d.replace(
    u'  <view class="navbar">',
    u'  <view class="navbar" style="padding-top:{{statusBarHeight}}px">'
)
d=d.replace(
    u'    <view class="navbar-right">',
    u'    <view class="navbar-right">',
    
)
# add statusBarHeight to data binding in wxml — already done via style
io.open('d:/FurForever/miniprogram/pages/diary/index.wxml','w',encoding='utf-8').write(d)
print('diary wxml ok')
