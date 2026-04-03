<<<<<<< HEAD
# -*- coding: utf-8 -*-
import io
c=u''
c+=u'  <view class="modal-overlay" wx:if="{{showRecordModal}}" bindtap="hideRecordModal"><view class="modal-content record-modal" catchtap="stopPropagation"><view class="modal-header"><text class="modal-title">{{recordModalTitle}}</text><text class="modal-close" bindtap="hideRecordModal">\u00d7</text></view><view class="modal-summary" wx:if="{{recordModalSummary}}"><text class="summary-text">{{recordModalSummary}}</text></view><scroll-view class="modal-body" scroll-y>\n'
c+=u"  <view wx:if=\"{{recordModalType==='feeding'}}\"><view class=\"form-section\"><text class=\"form-label\">\u98df\u7269\u7c7b\u578b</text><view class=\"options-grid\">\n"
for t in[u'\u4e3b\u7cae',u'\u96f6\u98df',u'\u7f50\u5934',u'\u52a0\u9910']:
 c+=u"    <view class=\"option-item {{feedingData.type==='%s'?'selected':''}}\" data-type=\"%s\" bindtap=\"selectFeedingType\"><text>%s</text></view>\n"%(t,t,t)
c+=u'  </view></view><view class="form-section"><text class="form-label">\u5206\u91cf</text><view class="input-with-unit"><input class="form-input" type="number" placeholder="\u8bf7\u8f93\u5165" value="{{feedingData.amount}}" bindinput="onFeedingAmountInput"/>\n'
for u2 in[u'\u514b',u'\u7897']:
 c+=u"    <view class=\"unit-option {{feedingData.unit==='%s'?'selected':''}}\" data-unit=\"%s\" bindtap=\"selectFeedingUnit\"><text>%s</text></view>\n"%(u2,u2,u2)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='hydration'}}\"><view class=\"form-section\"><text class=\"form-label\">\u996e\u6c34\u72b6\u6001</text><view class=\"options-grid\">\n"
for s in[u'\u6b63\u5e38',u'\u504f\u591a',u'\u504f\u5c11',u'\u672a\u996e\u6c34']:
 c+=u"    <view class=\"option-item {{hydrationData.status==='%s'?'selected':''}}\" data-status=\"%s\" bindtap=\"selectHydrationStatus\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='excretion'}}\"><view class=\"form-section\"><text class=\"form-label\">\u4fbf\u4fbf\u72b6\u6001</text><view class=\"options-grid\">\n"
for s in[u'\u6b63\u5e38',u'\u62c9\u7a00',u'\u4fbf\u79d8',u'\u5e26\u8840']:
 c+=u"    <view class=\"option-item {{excretionData.poopStatus==='%s'?'selected':''}}\" data-status=\"%s\" bindtap=\"selectPoopStatus\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view><view class="form-section"><text class="form-label">\u5c3f\u5c3f\u72b6\u6001</text><view class="options-grid">\n'
for s in[u'\u6b63\u5e38',u'\u9891\u7e41',u'\u95ed\u5c3f',u'\u4e71\u5c3f']:
 c+=u"    <view class=\"option-item {{excretionData.peeStatus==='%s'?'selected':''}}\" data-status=\"%s\" bindtap=\"selectPeeStatus\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='activity'}}\"><view class=\"form-section\"><text class=\"form-label\">\u8fd0\u52a8\u65f6\u957f\uff08\u5206\u949f\uff09</text><input class=\"form-input\" type=\"number\" placeholder=\"\u8bf7\u8f93\u5165\" value=\"{{activityData.duration}}\" bindinput=\"onActivityDurationInput\"/></view><view class=\"form-section\"><text class=\"form-label\">\u8fd0\u52a8\u5f3a\u5ea6</text><view class=\"options-grid\">\n"
for s in[u'\u75af\u72c2\u8dd1\u8df3',u'\u6563\u6b65',u'\u793e\u4ea4']:
 c+=u"    <view class=\"option-item {{activityData.intensity==='%s'?'selected':''}}\" data-intensity=\"%s\" bindtap=\"selectActivityIntensity\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='sleep'}}\"><view class=\"form-section\"><text class=\"form-label\">\u7761\u7720\u65f6\u957f\uff08\u5c0f\u65f6\uff09</text><input class=\"form-input\" type=\"number\" placeholder=\"\u8bf7\u8f93\u5165\" value=\"{{sleepData.duration}}\" bindinput=\"onSleepDurationInput\"/></view><view class=\"form-section\"><text class=\"form-label\">\u7761\u7720\u8868\u73b0</text><view class=\"options-grid\">\n"
for s in[u'\u6df1\u7761',u'\u6613\u60ca\u9192',u'\u6253\u547c']:
 c+=u"    <view class=\"option-item {{sleepData.quality==='%s'?'selected':''}}\" data-quality=\"%s\" bindtap=\"selectSleepQuality\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='mood'}}\"><view class=\"form-section\"><text class=\"form-label\">\u60c5\u7eea\u72b6\u6001</text><view class=\"options-grid\">\n"
for m,e in[(u'\u5f00\u5fc3',u'\U0001f60a'),(u'\u597d\u5947',u'\U0001f914'),(u'\u6124\u6012',u'\U0001f620'),(u'\u7126\u8651',u'\U0001f630'),(u'\u80c6\u5c0f',u'\U0001f628'),(u'Emo',u'\U0001f614')]:
 c+=u"    <view class=\"option-item {{moodData.mood==='%s'?'selected':''}}\" data-mood=\"%s\" bindtap=\"selectMood\"><text>%s %s</text></view>\n"%(m,m,e,m)
c+=u'  </view></view></view>\n'
c+=u'    </scroll-view><view class="modal-footer"><view class="btn btn-cancel" bindtap="hideRecordModal">\u53d6\u6d88</view><view class="btn btn-primary" bindtap="saveRecord">\u4fdd\u5b58</view></view></view></view>\n'
c+=u'  <view class="modal-overlay" wx:if="{{showPetModal}}" bindtap="hidePetModal"><view class="modal-content" catchtap="stopPropagation"><view class="modal-header"><text class="modal-title">\u9009\u62e9\u5ba0\u7269</text><text class="modal-close" bindtap="hidePetModal">\u00d7</text></view><scroll-view class="modal-body" scroll-y>\n'
c+=u"    <view class=\"pet-item {{currentPet&&pet._id===currentPet._id?'selected':''}}\" wx:for=\"{{pets}}\" wx:key=\"_id\" data-pet=\"{{pet}}\" bindtap=\"selectPet\"><view class=\"pet-avatar\"><text class=\"pet-avatar-text\" wx:if=\"{{pet.avatar}}\">{{pet.avatar}}</text><text class=\"pet-avatar-text\" wx:else>\U0001f43e</text></view><view class=\"pet-info\"><text class=\"pet-name\">{{pet.name}}</text><text class=\"pet-details\">{{pet.type}} \u00b7 {{pet.breed}}</text></view><text class=\"pet-check\" wx:if=\"{{currentPet&&pet._id===currentPet._id}}\">\u2713</text></view>\n"
c+=u'    <view class="add-pet-btn" bindtap="addNewPet"><text class="add-icon">+</text><text class="add-text">\u6dfb\u52a0\u65b0\u5ba0\u7269</text></view>\n'
c+=u'  </scroll-view></view></view>\n</view>\n'
with io.open('d:/FurForever/miniprogram/pages/home/index.wxml','a',encoding='utf-8') as f:
 f.write(c)
print('p2ok')

=======
# -*- coding: utf-8 -*-
import io
c=u''
c+=u'  <view class="modal-overlay" wx:if="{{showRecordModal}}" bindtap="hideRecordModal"><view class="modal-content record-modal" catchtap="stopPropagation"><view class="modal-header"><text class="modal-title">{{recordModalTitle}}</text><text class="modal-close" bindtap="hideRecordModal">\u00d7</text></view><view class="modal-summary" wx:if="{{recordModalSummary}}"><text class="summary-text">{{recordModalSummary}}</text></view><scroll-view class="modal-body" scroll-y>\n'
c+=u"  <view wx:if=\"{{recordModalType==='feeding'}}\"><view class=\"form-section\"><text class=\"form-label\">\u98df\u7269\u7c7b\u578b</text><view class=\"options-grid\">\n"
for t in[u'\u4e3b\u7cae',u'\u96f6\u98df',u'\u7f50\u5934',u'\u52a0\u9910']:
 c+=u"    <view class=\"option-item {{feedingData.type==='%s'?'selected':''}}\" data-type=\"%s\" bindtap=\"selectFeedingType\"><text>%s</text></view>\n"%(t,t,t)
c+=u'  </view></view><view class="form-section"><text class="form-label">\u5206\u91cf</text><view class="input-with-unit"><input class="form-input" type="number" placeholder="\u8bf7\u8f93\u5165" value="{{feedingData.amount}}" bindinput="onFeedingAmountInput"/>\n'
for u2 in[u'\u514b',u'\u7897']:
 c+=u"    <view class=\"unit-option {{feedingData.unit==='%s'?'selected':''}}\" data-unit=\"%s\" bindtap=\"selectFeedingUnit\"><text>%s</text></view>\n"%(u2,u2,u2)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='hydration'}}\"><view class=\"form-section\"><text class=\"form-label\">\u996e\u6c34\u72b6\u6001</text><view class=\"options-grid\">\n"
for s in[u'\u6b63\u5e38',u'\u504f\u591a',u'\u504f\u5c11',u'\u672a\u996e\u6c34']:
 c+=u"    <view class=\"option-item {{hydrationData.status==='%s'?'selected':''}}\" data-status=\"%s\" bindtap=\"selectHydrationStatus\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='excretion'}}\"><view class=\"form-section\"><text class=\"form-label\">\u4fbf\u4fbf\u72b6\u6001</text><view class=\"options-grid\">\n"
for s in[u'\u6b63\u5e38',u'\u62c9\u7a00',u'\u4fbf\u79d8',u'\u5e26\u8840']:
 c+=u"    <view class=\"option-item {{excretionData.poopStatus==='%s'?'selected':''}}\" data-status=\"%s\" bindtap=\"selectPoopStatus\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view><view class="form-section"><text class="form-label">\u5c3f\u5c3f\u72b6\u6001</text><view class="options-grid">\n'
for s in[u'\u6b63\u5e38',u'\u9891\u7e41',u'\u95ed\u5c3f',u'\u4e71\u5c3f']:
 c+=u"    <view class=\"option-item {{excretionData.peeStatus==='%s'?'selected':''}}\" data-status=\"%s\" bindtap=\"selectPeeStatus\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='activity'}}\"><view class=\"form-section\"><text class=\"form-label\">\u8fd0\u52a8\u65f6\u957f\uff08\u5206\u949f\uff09</text><input class=\"form-input\" type=\"number\" placeholder=\"\u8bf7\u8f93\u5165\" value=\"{{activityData.duration}}\" bindinput=\"onActivityDurationInput\"/></view><view class=\"form-section\"><text class=\"form-label\">\u8fd0\u52a8\u5f3a\u5ea6</text><view class=\"options-grid\">\n"
for s in[u'\u75af\u72c2\u8dd1\u8df3',u'\u6563\u6b65',u'\u793e\u4ea4']:
 c+=u"    <view class=\"option-item {{activityData.intensity==='%s'?'selected':''}}\" data-intensity=\"%s\" bindtap=\"selectActivityIntensity\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='sleep'}}\"><view class=\"form-section\"><text class=\"form-label\">\u7761\u7720\u65f6\u957f\uff08\u5c0f\u65f6\uff09</text><input class=\"form-input\" type=\"number\" placeholder=\"\u8bf7\u8f93\u5165\" value=\"{{sleepData.duration}}\" bindinput=\"onSleepDurationInput\"/></view><view class=\"form-section\"><text class=\"form-label\">\u7761\u7720\u8868\u73b0</text><view class=\"options-grid\">\n"
for s in[u'\u6df1\u7761',u'\u6613\u60ca\u9192',u'\u6253\u547c']:
 c+=u"    <view class=\"option-item {{sleepData.quality==='%s'?'selected':''}}\" data-quality=\"%s\" bindtap=\"selectSleepQuality\"><text>%s</text></view>\n"%(s,s,s)
c+=u'  </view></view></view>\n'
c+=u"  <view wx:if=\"{{recordModalType==='mood'}}\"><view class=\"form-section\"><text class=\"form-label\">\u60c5\u7eea\u72b6\u6001</text><view class=\"options-grid\">\n"
for m,e in[(u'\u5f00\u5fc3',u'\U0001f60a'),(u'\u597d\u5947',u'\U0001f914'),(u'\u6124\u6012',u'\U0001f620'),(u'\u7126\u8651',u'\U0001f630'),(u'\u80c6\u5c0f',u'\U0001f628'),(u'Emo',u'\U0001f614')]:
 c+=u"    <view class=\"option-item {{moodData.mood==='%s'?'selected':''}}\" data-mood=\"%s\" bindtap=\"selectMood\"><text>%s %s</text></view>\n"%(m,m,e,m)
c+=u'  </view></view></view>\n'
c+=u'    </scroll-view><view class="modal-footer"><view class="btn btn-cancel" bindtap="hideRecordModal">\u53d6\u6d88</view><view class="btn btn-primary" bindtap="saveRecord">\u4fdd\u5b58</view></view></view></view>\n'
c+=u'  <view class="modal-overlay" wx:if="{{showPetModal}}" bindtap="hidePetModal"><view class="modal-content" catchtap="stopPropagation"><view class="modal-header"><text class="modal-title">\u9009\u62e9\u5ba0\u7269</text><text class="modal-close" bindtap="hidePetModal">\u00d7</text></view><scroll-view class="modal-body" scroll-y>\n'
c+=u"    <view class=\"pet-item {{currentPet&&pet._id===currentPet._id?'selected':''}}\" wx:for=\"{{pets}}\" wx:key=\"_id\" data-pet=\"{{pet}}\" bindtap=\"selectPet\"><view class=\"pet-avatar\"><text class=\"pet-avatar-text\" wx:if=\"{{pet.avatar}}\">{{pet.avatar}}</text><text class=\"pet-avatar-text\" wx:else>\U0001f43e</text></view><view class=\"pet-info\"><text class=\"pet-name\">{{pet.name}}</text><text class=\"pet-details\">{{pet.type}} \u00b7 {{pet.breed}}</text></view><text class=\"pet-check\" wx:if=\"{{currentPet&&pet._id===currentPet._id}}\">\u2713</text></view>\n"
c+=u'    <view class="add-pet-btn" bindtap="addNewPet"><text class="add-icon">+</text><text class="add-text">\u6dfb\u52a0\u65b0\u5ba0\u7269</text></view>\n'
c+=u'  </scroll-view></view></view>\n</view>\n'
with io.open('d:/FurForever/miniprogram/pages/home/index.wxml','a',encoding='utf-8') as f:
 f.write(c)
print('p2ok')

>>>>>>> origin/main
