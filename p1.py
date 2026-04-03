<<<<<<< HEAD
# -*- coding: utf-8 -*-
import io

c = u''
c += u'<!-- home/index.wxml -->\n<view class="home-container">\n'
c += u'  <view class="navbar"><view class="navbar-left"><text class="navbar-title">\u5ba0\u7269\u65e5\u5e38\u8bb0\u5f55</text></view>\n'
c += u'    <view class="navbar-right"><view class="navbar-icon" bindtap="switchPet"><text class="icon">\U0001f43e</text><text class="pet-name" wx:if="{{currentPet}}">{{currentPet.name}}</text><text class="pet-name" wx:else>\u9009\u62e9\u5ba0\u7269</text></view></view></view>\n'
c += u'  <scroll-view class="main-content" scroll-y>\n'
c += u'    <view class="date-section"><view class="date-header"><text class="month">{{currentMonth}}</text>\n'
c += u"      <view class=\"date-nav\"><text class=\"nav-btn\" bindtap=\"prevDay\">\u2039</text><text class=\"current-date\">{{currentDate}}</text><text class=\"nav-btn\" bindtap=\"nextDay\">\u203a</text></view></view>\n"
c += u"    <scroll-view class=\"horizontal-calendar\" scroll-x><view class=\"calendar-days\"><view class=\"day-item {{day.isSelected ? 'selected' : ''}} {{day.hasRecord ? 'has-record' : ''}}\" wx:for=\"{{calendarDays}}\" wx:key=\"date\" data-date=\"{{day.date}}\" bindtap=\"selectDate\"><text class=\"day-week\">{{day.week}}</text><text class=\"day-date\">{{day.day}}</text><view class=\"day-indicator\" wx:if=\"{{day.hasRecord}}\"></view></view></view></scroll-view></view>\n"
c += u'    <view class="records-section">\n'
c += u'      <view class="module-section"><view class="module-header"><text class="module-title">\u65e5\u5e38\u8bb0\u5f55</text><text class="module-subtitle">Daily Routine</text></view><view class="module-divider"></view><view class="cards-grid">\n'
for fn,ico,lbl in [('recordFeeding','\U0001f37d\ufe0f','\u996e\u98df'),('recordHydration','\U0001f4a7','\u996e\u6c34'),('recordExcretion','\U0001f6bd','\u6392\u6ccf'),('recordActivity','\U0001f3c3','\u8fd0\u52a8'),('recordSleep','\U0001f634','\u7761\u7720'),('recordMood','\U0001f60a','\u60c5\u7eea')]:
    c += u'        <view class="card-item" bindtap="%s"><view class="card-icon">%s</view><text class="card-title">%s</text><text class="card-subtitle">{{recordSummaries.%s}}</text></view>\n' % (fn,ico,lbl,fn.replace('record','').lower())
c += u'      </view></view>\n'
c += u'      <view class="module-section"><view class="module-header"><text class="module-title">\u5065\u5eb7\u7ba1\u7406</text><text class="module-subtitle">Medical &amp; Care</text></view><view class="module-divider"></view><view class="cards-grid">\n'
for fn,ico,lbl,sub in [('recordVaccine','\U0001f489','\u75ab\u82d7','\u9884\u9632\u533b\u7597'),('recordDeworming','\U0001f41b','\u9a71\u866b','\u9884\u9632\u533b\u7597'),('recordGrooming','\U0001f6c1','\u62a4\u7406','\u6e05\u6d01\u7f8e\u5bb9'),('recordMedical','\U0001f3e5','\u533b\u7597','\u5c31\u8bca\u7528\u836f')]:
    c += u'        <view class="card-item" bindtap="%s"><view class="card-icon">%s</view><text class="card-title">%s</text><text class="card-subtitle">%s</text></view>\n' % (fn,ico,lbl,sub)
c += u'      </view></view>\n    </view>\n    <view class="bottom-space"></view>\n  </scroll-view>\n'

with io.open('d:/FurForever/miniprogram/pages/home/index.wxml', 'w', encoding='utf-8') as f:
    f.write(c)
print('p1ok')

=======
# -*- coding: utf-8 -*-
import io

c = u''
c += u'<!-- home/index.wxml -->\n<view class="home-container">\n'
c += u'  <view class="navbar"><view class="navbar-left"><text class="navbar-title">\u5ba0\u7269\u65e5\u5e38\u8bb0\u5f55</text></view>\n'
c += u'    <view class="navbar-right"><view class="navbar-icon" bindtap="switchPet"><text class="icon">\U0001f43e</text><text class="pet-name" wx:if="{{currentPet}}">{{currentPet.name}}</text><text class="pet-name" wx:else>\u9009\u62e9\u5ba0\u7269</text></view></view></view>\n'
c += u'  <scroll-view class="main-content" scroll-y>\n'
c += u'    <view class="date-section"><view class="date-header"><text class="month">{{currentMonth}}</text>\n'
c += u"      <view class=\"date-nav\"><text class=\"nav-btn\" bindtap=\"prevDay\">\u2039</text><text class=\"current-date\">{{currentDate}}</text><text class=\"nav-btn\" bindtap=\"nextDay\">\u203a</text></view></view>\n"
c += u"    <scroll-view class=\"horizontal-calendar\" scroll-x><view class=\"calendar-days\"><view class=\"day-item {{day.isSelected ? 'selected' : ''}} {{day.hasRecord ? 'has-record' : ''}}\" wx:for=\"{{calendarDays}}\" wx:key=\"date\" data-date=\"{{day.date}}\" bindtap=\"selectDate\"><text class=\"day-week\">{{day.week}}</text><text class=\"day-date\">{{day.day}}</text><view class=\"day-indicator\" wx:if=\"{{day.hasRecord}}\"></view></view></view></scroll-view></view>\n"
c += u'    <view class="records-section">\n'
c += u'      <view class="module-section"><view class="module-header"><text class="module-title">\u65e5\u5e38\u8bb0\u5f55</text><text class="module-subtitle">Daily Routine</text></view><view class="module-divider"></view><view class="cards-grid">\n'
for fn,ico,lbl in [('recordFeeding','\U0001f37d\ufe0f','\u996e\u98df'),('recordHydration','\U0001f4a7','\u996e\u6c34'),('recordExcretion','\U0001f6bd','\u6392\u6ccf'),('recordActivity','\U0001f3c3','\u8fd0\u52a8'),('recordSleep','\U0001f634','\u7761\u7720'),('recordMood','\U0001f60a','\u60c5\u7eea')]:
    c += u'        <view class="card-item" bindtap="%s"><view class="card-icon">%s</view><text class="card-title">%s</text><text class="card-subtitle">{{recordSummaries.%s}}</text></view>\n' % (fn,ico,lbl,fn.replace('record','').lower())
c += u'      </view></view>\n'
c += u'      <view class="module-section"><view class="module-header"><text class="module-title">\u5065\u5eb7\u7ba1\u7406</text><text class="module-subtitle">Medical &amp; Care</text></view><view class="module-divider"></view><view class="cards-grid">\n'
for fn,ico,lbl,sub in [('recordVaccine','\U0001f489','\u75ab\u82d7','\u9884\u9632\u533b\u7597'),('recordDeworming','\U0001f41b','\u9a71\u866b','\u9884\u9632\u533b\u7597'),('recordGrooming','\U0001f6c1','\u62a4\u7406','\u6e05\u6d01\u7f8e\u5bb9'),('recordMedical','\U0001f3e5','\u533b\u7597','\u5c31\u8bca\u7528\u836f')]:
    c += u'        <view class="card-item" bindtap="%s"><view class="card-icon">%s</view><text class="card-title">%s</text><text class="card-subtitle">%s</text></view>\n' % (fn,ico,lbl,sub)
c += u'      </view></view>\n    </view>\n    <view class="bottom-space"></view>\n  </scroll-view>\n'

with io.open('d:/FurForever/miniprogram/pages/home/index.wxml', 'w', encoding='utf-8') as f:
    f.write(c)
print('p1ok')

>>>>>>> origin/main
