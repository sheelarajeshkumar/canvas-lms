/*
 * Copyright (C) 2017 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import I18n from 'i18n!shared_components'
import React from 'react'
import { bool, func } from 'prop-types'
import $ from 'jquery'
import 'jquery.instructure_date_and_time'

import Container from '@instructure/ui-core/lib/components/Container'
import Text from '@instructure/ui-core/lib/components/Text'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import { MenuItem } from '@instructure/ui-core/lib/components/Menu'
import IconTimer from 'instructure-icons/lib/Line/IconTimerLine'
import IconReply from 'instructure-icons/lib/Line/IconReplyLine'
import IconTrash from 'instructure-icons/lib/Line/IconTrashLine'

import AnnouncementModel from 'compiled/models/Announcement'
import SectionsTooltip from '../SectionsTooltip'
import CourseItemRow from './CourseItemRow'
import UnreadBadge from './UnreadBadge'
import announcementShape from '../proptypes/announcement'
import masterCourseDataShape from '../proptypes/masterCourseData'
import { isPassedDelayedPostAt } from '../../announcements/utils'

function makeTimestamp({delayed_post_at}) {
  return (delayed_post_at
    && !isPassedDelayedPostAt({ currentDate: null, delayedDate: delayed_post_at}))
    ? {
        title: (
          <span>
            <Container margin="0 x-small">
              <Text color="secondary">
                <IconTimer />
              </Text>
            </Container>
            {I18n.t('Delayed until:')}
          </span>
        ),
        date: delayed_post_at
      }
    : {title: I18n.t('Posted on:'), date: delayed_post_at}
}

export default function AnnouncementRow (
  { announcement, canManage, masterCourseData, rowRef, onSelectedChanged,
    onManageMenuSelect, canHaveSections, announcementsLocked }) {
  const timestamp = makeTimestamp(announcement)
  const readCount = announcement.discussion_subentry_count > 0
    ? (
      <UnreadBadge
        unreadCount={announcement.unread_count}
        unreadLabel={I18n.t('%{count} unread replies', { count: announcement.unread_count })}
        totalCount={announcement.discussion_subentry_count}
        totalLabel={I18n.t('%{count} replies', { count: announcement.discussion_subentry_count })}
      />
    )
    : null

  const sectionsToolTip = canHaveSections
    ? (
      <SectionsTooltip
        totalUserCount={announcement.user_count}
        sections={announcement.sections}
      />
    )
    : null

  const replyButton = announcement.locked
      ? null
      : (
        <Container display="block" margin="x-small 0 0">
          <Text color="brand"><IconReply /> {I18n.t('Reply')}</Text>
        </Container>
      )

  const MenuList = [
    <MenuItem
      key="delete"
      value={{ action: 'delete', id: announcement.id }}
      id="delete-announcement-menu-option"
    >
      <span aria-hidden='true'>
        <IconTrash />&nbsp;&nbsp;{I18n.t('Delete')}
      </span>
      <ScreenReaderContent>{I18n.t('Delete announcement %{title}', { title: announcement.title })}</ScreenReaderContent>
    </MenuItem>,
  ]
  if (!announcementsLocked) {
    MenuList.push(
      <MenuItem
        key="lock"
        value={{ action: 'lock', id: announcement.id, lock: !announcement.locked }}
        id="lock-announcement-menu-option"
      >
        <span aria-hidden='true'>
          <IconReply />&nbsp;&nbsp;{announcement.locked ? I18n.t('Allow Comments') : I18n.t('Disallow Comments')}
        </span>
        <ScreenReaderContent>
        { announcement.locked
          ? I18n.t('Allow replies for %{title}', { title: announcement.title })
          : I18n.t('Disallow replies for %{title}', { title: announcement.title })}
        </ScreenReaderContent>
      </MenuItem>
    )
  }

  // necessary because announcements return html from RCE
  const contentWrapper = document.createElement('span')
  contentWrapper.innerHTML = announcement.message
  const textContent = contentWrapper.textContent.trim()

  return (
    <CourseItemRow
      title={announcement.title}
      body={textContent ? <div className="ic-announcement-row__content">{textContent}</div> : null}
      sectionToolTip={sectionsToolTip}
      replyButton={replyButton}
      ref={rowRef}
      className="ic-announcement-row"
      selectable={canManage}
      showAvatar
      id={announcement.id}
      isRead={announcement.read_state === 'read'}
      author={announcement.author}
      itemUrl={announcement.html_url}
      onSelectedChanged={onSelectedChanged}
      masterCourse={{
        courseData: masterCourseData || {},
        getLockOptions: () => ({
          model: new AnnouncementModel(announcement),
          unlockedText: I18n.t('%{title} is unlocked. Click to lock.', {title: announcement.title}),
          lockedText: I18n.t('%{title} is locked. Click to unlock', {title: announcement.title}),
          course_id: masterCourseData.masterCourse.id,
          content_id: announcement.id,
          content_type: 'discussion_topic',
        }),
      }}
      metaContent={
        <div>
          <span className="ic-item-row__meta-content-heading">
            <Text size="small" as="p">{timestamp.title}</Text>
          </span>
          <span className="ic-item-row__meta-content-timestamp">
            <Text color="secondary" size="small" as="p">
              {$.datetimeString(timestamp.date, {format: 'medium'})}
            </Text>
          </span>
        </div>
      }
      actionsContent={readCount}
      showManageMenu={canManage}
      onManageMenuSelect={onManageMenuSelect}
      manageMenuOptions={canManage && MenuList || null}
    />
  )
}

AnnouncementRow.propTypes = {
  announcement: announcementShape.isRequired,
  canManage: bool,
  canHaveSections: bool,
  masterCourseData: masterCourseDataShape,
  rowRef: func,
  onSelectedChanged: func,
  onManageMenuSelect: func,
  announcementsLocked: bool,
}

AnnouncementRow.defaultProps = {
  canManage: false,
  canHaveSections: false,
  masterCourseData: null,
  rowRef () {},
  onSelectedChanged () {},
  onManageMenuSelect () {},
  announcementsLocked: false,
}
