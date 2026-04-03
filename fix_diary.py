# -*- coding: utf-8 -*-
import io
c=u''
c+=u'<!-- diary/index.wxml -->\n<view class="diary-container">\n'
c+=u'  <view class="navbar"><view class="navbar-left"><text class="navbar-title">\u5ba0\u7269\u65e5\u8bb0</text></view>\n'
c+=u'    <view class="navbar-right"><view class="navbar-icon" bindtap="switchPet"><text class="icon">\U0001f43e</text><text class="pet-name" wx:if="{{currentPet}}">{{currentPet.name}}</text><text class="pet-name" wx:else>\u9009\u62e9\u5ba0\u7269</text></view>\n'
c+=u'    <view class="navbar-icon" bindtap="createDiary"><text class="icon">\u270f\ufe0f</text><text class="icon-text">\u5199\u65e5\u8bb0</text></view></view></view>\n'
c+=u'  <scroll-view class="main-content" scroll-y wx:if="{{diaries.length>0}}">\n'
c+=u'    <view class="timeline">\n'
c+=u"      <view class=\"timeline-item\" wx:for=\"{{diaries}}\" wx:key=\"_id\"><view class=\"timeline-node\"><view class=\"node-dot\"></view><view class=\"node-line\"></view></view>\n"
c+=u'        <view class="diary-card"><view class="diary-date"><text class="date-day">{{item.displayDate.day}}</text><text class="date-month">{{item.displayDate.month}}</text><text class="date-week">{{item.displayDate.week}}</text></view>\n'
c+=u'          <view class="diary-content"><view class="diary-header"><text class="diary-title">{{item.title}}</text><view class="diary-mood"><text class="mood-icon">{{item.moodIcon}}</text><text class="mood-text">{{item.mood}}</text></view></view>\n'
c+=u'          <text class="diary-text">{{item.contentPreview}}</text>\n'
c+=u'          <view class="diary-images" wx:if="{{item.images&&item.images.length>0}}"><scroll-view class="images-scroll" scroll-x><view class="images-container">\n'
c+=u"            <image class=\"diary-image\" wx:for=\"{{item.images}}\" wx:key=\"index\" wx:for-item=\"img\" src=\"{{img}}\" mode=\"aspectFill\" data-index=\"{{index}}\" data-images=\"{{item.images}}\" bindtap=\"previewImage\"/>\n"
c+=u'          </view></scroll-view></view>\n'
c+=u'          <view class="diary-actions"><text class="action-btn" bindtap="deleteDiary" data-id="{{item._id}}">\u5220\u9664</text></view>\n'
c+=u'        </view></view></view>\n'
c+=u'    </view>\n'
c+=u'    <view class="load-more" wx:if="{{hasMore}}"><text class="load-text" bindtap="loadMore">\u52a0\u8f7d\u66f4\u591a</text></view>\n'
c+=u'    <view class="bottom-space"></view></scroll-view>\n'
c+=u'  <view class="empty-state" wx:else><view class="empty-icon">\U0001f4dd</view><text class="empty-title">\u8fd8\u6ca1\u6709\u65e5\u8bb0\u8bb0\u5f55</text><text class="empty-subtitle">\u8bb0\u5f55\u5ba0\u7269\u7684\u6210\u957f\u70b9\u6ef4</text><view class="empty-btn" bindtap="createDiary">\u5199\u7b2c\u4e00\u7bc7\u65e5\u8bb0</view></view>\n'
# diary modal
c+=u'  <view class="modal-overlay" wx:if="{{showDiaryModal}}" bindtap="hideDiaryModal"><view class="modal-content diary-modal" catchtap="stopPropagation">\n'
c+=u'    <view class="modal-header"><text class="modal-title">\u5199\u65e5\u8bb0</text><text class="modal-close" bindtap="hideDiaryModal">\u00d7</text></view>\n'
c+=u'    <scroll-view class="modal-body" scroll-y>\n'
c+=u'      <view class="form-section"><text class="form-label">\u65e5\u8bb0\u6807\u9898</text><input class="form-input" placeholder="\u7ed9\u4eca\u5929\u8d77\u4e2a\u6807\u9898\u5427\uff08\u53ef\u9009\uff09" value="{{diaryForm.title}}" bindinput="onDiaryTitleInput" maxlength="30"/></view>\n'
c+=u'      <view class="form-section"><text class="form-label">\u65e5\u8bb0\u5185\u5bb9 *</text><textarea class="diary-textarea" placeholder="\u8bb0\u5f55\u5ba0\u7269\u4eca\u5929\u7684\u6545\u4e8b..." value="{{diaryForm.content}}" bindinput="onDiaryContentInput" maxlength="2000" auto-height/></view>\n'
c+=u'      <view class="form-section"><text class="form-label">\u4eca\u65e5\u5fc3\u60c5</text><view class="mood-grid">\n'
for m,e in[(u'\u5f00\u5fc3',u'\U0001f60a'),(u'\u597d\u5947',u'\U0001f914'),(u'\u6124\u6012',u'\U0001f620'),(u'\u7126\u8651',u'\U0001f630'),(u'\u80c6\u5c0f',u'\U0001f628'),(u'Emo',u'\U0001f614')]:
    c+=u"        <view class=\"mood-item {{diaryForm.mood==='%s'?'selected':''}}\" data-mood=\"%s\" bindtap=\"selectDiaryMood\"><text>%s %s</text></view>\n"%(m,m,e,m)
c+=u'      </view></view>\n'
c+=u'      <view class="form-section"><text class="form-label">\u4e0a\u4f20\u7167\u7247</text><view class="image-picker">\n'
c+=u"        <view class=\"image-thumb\" wx:for=\"{{diaryForm.images}}\" wx:key=\"index\"><image class=\"thumb-img\" src=\"{{item}}\" mode=\"aspectFill\" data-index=\"{{index}}\" bindtap=\"previewDiaryImage\"/><view class=\"thumb-delete\" data-index=\"{{index}}\" bindtap=\"removeImage\">\u00d7</view></view>\n"
c+=u'        <view class="image-add-btn" bindtap="chooseImages" wx:if="{{diaryForm.images.length<9}}"><text class="add-icon">+</text><text class="add-label">\u6dfb\u52a0\u56fe\u7247</text></view>\n'
c+=u'      </view></view>\n'
c+=u'    </scroll-view>\n'
c+=u'    <view class="modal-footer"><view class="btn btn-cancel" bindtap="hideDiaryModal">\u53d6\u6d88</view><view class="btn btn-primary" bindtap="saveDiary">\u4fdd\u5b58\u65e5\u8bb0</view></view>\n'
c+=u'  </view></view>\n'
# pet modal
c+=u'  <view class="modal-overlay" wx:if="{{showPetModal}}" bindtap="hidePetModal"><view class="modal-content" catchtap="stopPropagation">\n'
c+=u'    <view class="modal-header"><text class="modal-title">\u9009\u62e9\u5ba0\u7269</text><text class="modal-close" bindtap="hidePetModal">\u00d7</text></view>\n'
c+=u'    <scroll-view class="modal-body" scroll-y>\n'
c+=u"      <view class=\"pet-item {{currentPet&&pet._id===currentPet._id?'selected':''}}\" wx:for=\"{{pets}}\" wx:key=\"_id\" data-pet=\"{{pet}}\" bindtap=\"selectPet\"><view class=\"pet-avatar\"><text class=\"pet-avatar-text\" wx:if=\"{{pet.avatar}}\">{{pet.avatar}}</text><text class=\"pet-avatar-text\" wx:else>\U0001f43e</text></view><view class=\"pet-info\"><text class=\"pet-name\">{{pet.name}}</text><text class=\"pet-details\">{{pet.type}} \u00b7 {{pet.breed}}</text></view><text class=\"pet-check\" wx:if=\"{{currentPet&&pet._id===currentPet._id}}\">\u2713</text></view>\n"
c+=u'      <view class="add-pet-btn" bindtap="addNewPet"><text class="add-icon">+</text><text class="add-text">\u6dfb\u52a0\u65b0\u5ba0\u7269</text></view>\n'
c+=u'    </scroll-view></view></view>\n'
c+=u'</view>\n'
with io.open('d:/FurForever/miniprogram/pages/diary/index.wxml','w',encoding='utf-8') as f:
    f.write(c)
print('ok')
