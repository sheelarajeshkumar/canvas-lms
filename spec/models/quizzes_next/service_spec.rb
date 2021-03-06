# Copyright (C) 2018 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper.rb')

describe QuizzesNext::Service do
  Service = QuizzesNext::Service

  describe '.enabled_in_context?' do
    let(:context) { double("context") }

    context 'when the feature is enabled on the context' do
      it 'will return true' do
        allow(context).to receive(:feature_enabled?).and_return(true)
        expect(Service.enabled_in_context?(context)).to eq(true)
      end
    end

    context 'when feature is enabled' do
      it 'will return false' do
        allow(context).to receive(:feature_enabled?).and_return(false)
        expect(Service.enabled_in_context?(context)).to eq(false)
      end
    end
  end

  describe '.active_lti_assignments_for_course' do
    it 'returns active lti assignments in the course' do
      course = course_model
      lti_assignment_active1 = assignment_model(course: course)
      lti_assignment_active2 = assignment_model(course: course)
      lti_assignment_inactive = assignment_model(course: course)
      assignment_active = assignment_model(course: course)

      allow(lti_assignment_inactive).to receive(:active?).and_return(false)
      allow(lti_assignment_active1).to receive(:quiz_lti?).and_return(true)
      allow(lti_assignment_active2).to receive(:quiz_lti?).and_return(true)

      active_lti_assignments = Service.active_lti_assignments_for_course(course)

      expect(active_lti_assignments).to include(lti_assignment_active1)
      expect(active_lti_assignments).to include(lti_assignment_active2)
      expect(active_lti_assignments).not_to include(lti_assignment_inactive)
      expect(active_lti_assignments).not_to include(assignment_active)
    end
  end
end
