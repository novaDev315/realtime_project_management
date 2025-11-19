# Manual Testing Guide
## Real-Time Project Management Platform

**Version:** 1.0
**Last Updated:** November 2025
**Testing Duration:** ~4-6 hours for complete coverage

---

## Table of Contents

1. [Pre-Test Setup](#pre-test-setup)
2. [Feature Testing Checklist](#feature-testing-checklist)
3. [Use Case Scenarios](#use-case-scenarios)
4. [Integration Testing](#integration-testing)
5. [Edge Cases & Error Handling](#edge-cases--error-handling)
6. [Performance Testing](#performance-testing)
7. [Bug Reporting Template](#bug-reporting-template)

---

## Pre-Test Setup

### 1. Environment Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/realtime_pm
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:3000

# AI Features
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# Optional: Use OpenRouter instead
# OPENAI_BASE_URL=https://openrouter.ai/api/v1
# OPENAI_API_KEY=your_openrouter_key
EOF

# Start MongoDB (if not running)
mongod --dbpath /path/to/data/db

# Start Redis (if not running)
redis-server

# Start backend server
npm run dev
```

**✅ Verify:**
- [ ] Server starts without errors
- [ ] Console shows: "Server running on port 5000"
- [ ] Console shows: "MongoDB connected"
- [ ] Console shows: "Redis connected"
- [ ] Console shows: "Socket.io Redis adapter initialized"

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF

# Start frontend server
npm run dev
```

**✅ Verify:**
- [ ] Frontend starts on http://localhost:3000
- [ ] No console errors
- [ ] Can access the application

#### Test User Accounts

Create at least 3 test users for multi-user testing:

**User 1 (Project Manager):**
- Email: pm@test.com
- Password: Test123!
- Role: Admin

**User 2 (Developer):**
- Email: dev1@test.com
- Password: Test123!
- Role: Member

**User 3 (Designer):**
- Email: designer@test.com
- Password: Test123!
- Role: Member

---

## Feature Testing Checklist

### 🔐 Feature 1: Authentication & Authorization

#### Test 1.1: User Registration
**Steps:**
1. Navigate to http://localhost:3000/register
2. Enter valid email, name, and password
3. Click "Register"

**Expected Results:**
- [ ] Form validation works (email format, password strength)
- [ ] Success message appears
- [ ] Redirect to login page
- [ ] User record created in MongoDB

**Edge Cases:**
- [ ] Duplicate email shows error
- [ ] Weak password rejected
- [ ] Empty fields show validation errors

#### Test 1.2: User Login
**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter credentials for User 1
3. Click "Login"

**Expected Results:**
- [ ] JWT token stored in localStorage
- [ ] Redirect to dashboard
- [ ] User name displayed in header
- [ ] No console errors

**Edge Cases:**
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Token persists on page refresh

#### Test 1.3: Logout
**Steps:**
1. Click user menu in header
2. Click "Logout"

**Expected Results:**
- [ ] Token removed from localStorage
- [ ] Redirect to login page
- [ ] Cannot access protected routes

---

### 📋 Feature 2: Real-Time Kanban Boards

#### Test 2.1: Create Board
**Steps:**
1. Login as User 1
2. Navigate to Projects > Create Project
3. Enter project name "Test Project Alpha"
4. Create project
5. Navigate to Kanban Board view

**Expected Results:**
- [ ] Board created with default columns (To Do, In Progress, Done)
- [ ] Board loads without errors
- [ ] Can see empty columns

#### Test 2.2: Create Cards
**Steps:**
1. Click "Add Card" in "To Do" column
2. Fill in card details:
   - Title: "Implement user authentication"
   - Description: "Add JWT-based auth"
   - Priority: High
   - Story Points: 5
   - Assign to: User 2
3. Save card

**Expected Results:**
- [ ] Card appears in To Do column
- [ ] All card details saved correctly
- [ ] Assignee avatar displayed
- [ ] Priority badge shows "High" in red

**Create More Cards:**
- [ ] "Design landing page" (Priority: Medium, Points: 3)
- [ ] "Setup database schema" (Priority: High, Points: 8)
- [ ] "Write unit tests" (Priority: Low, Points: 2)

#### Test 2.3: Drag and Drop
**Steps:**
1. Drag "Implement user authentication" from "To Do" to "In Progress"
2. Observe the animation
3. Open browser DevTools > Network > WS (WebSocket)
4. Drag another card

**Expected Results:**
- [ ] Card moves smoothly
- [ ] Card appears in new column
- [ ] WebSocket event fires (card:moved)
- [ ] Position persists on refresh

#### Test 2.4: Real-Time Updates (Multi-User)
**Setup:** Open app in 2 browser windows (User 1 and User 2)

**Steps:**
1. User 1: Move a card from To Do → In Progress
2. User 2: Observe the board (no refresh)
3. User 2: Create a new card
4. User 1: Observe the board (no refresh)

**Expected Results:**
- [ ] User 2 sees card movement in <100ms
- [ ] User 1 sees new card appear instantly
- [ ] No page refresh needed
- [ ] WebSocket events in Network tab

#### Test 2.5: Live Cursor Tracking
**Setup:** Two browser windows (User 1 and User 2)

**Steps:**
1. User 1: Move mouse over the board
2. User 2: Observe cursor overlay
3. User 2: Move mouse
4. User 1: Observe User 2's cursor

**Expected Results:**
- [ ] User cursors appear with color-coded arrows
- [ ] User names displayed near cursors
- [ ] Cursors move smoothly (~20 updates/sec)
- [ ] Cursors disappear when user leaves (5s timeout)
- [ ] Own cursor not displayed

#### Test 2.6: Card Details & Comments
**Steps:**
1. Click on a card to open details modal
2. Add comment: "We need to review security best practices"
3. Save comment
4. Mention user: "@dev1 please review"
5. Add attachment (optional)

**Expected Results:**
- [ ] Modal opens with full card details
- [ ] Comment saves and displays with timestamp
- [ ] Mentioned user gets notification
- [ ] Comment author name and avatar shown
- [ ] Attachments schema ready (UI shows upload area)

---

### 🏃 Feature 3: Sprint Planning

#### Test 3.1: Create Sprint
**Steps:**
1. Navigate to Sprints tab
2. Click "Create Sprint"
3. Fill in:
   - Name: "Sprint 1 - Authentication Module"
   - Start Date: Today
   - End Date: 2 weeks from today
   - Goal: "Complete user authentication system"
   - Capacity: 40 story points
4. Save sprint

**Expected Results:**
- [ ] Sprint created with status "planning"
- [ ] Sprint appears in sprint list
- [ ] Dates validated (end > start)
- [ ] Sprint goal displayed

#### Test 3.2: Add Cards to Sprint
**Steps:**
1. Open Sprint 1
2. Click "Add Cards to Sprint"
3. Select cards from backlog
4. Observe total story points counter

**Expected Results:**
- [ ] Cards added to sprint
- [ ] Story points total updates
- [ ] Warning if exceeds capacity
- [ ] Cards marked as "In Sprint"

#### Test 3.3: Story Point Poker
**Setup:** Two browser windows (User 1 as facilitator, User 2 as team member)

**Steps:**
1. User 1: Navigate to Planning Poker tab
2. User 1: Select card "Implement user authentication"
3. Both users join the poker session
4. Both users select story points (User 1: 5, User 2: 8)
5. User 1: Click "Reveal Votes"
6. Observe average calculation
7. User 1: Click "Accept and Assign"

**Expected Results:**
- [ ] Both users see poker interface
- [ ] Vote selections hidden until reveal
- [ ] Reveal shows all votes simultaneously
- [ ] Average calculates to nearest Fibonacci (6.5 → 8)
- [ ] Consensus indicator shows agreement/disagreement
- [ ] Points assigned to card after acceptance
- [ ] Real-time updates via WebSocket

**Special Cards Test:**
- [ ] User selects "?" (Don't know)
- [ ] User selects "☕" (Coffee break)
- [ ] These don't affect average calculation

#### Test 3.4: Start Sprint
**Steps:**
1. Go to Sprint 1
2. Click "Start Sprint"
3. Confirm action

**Expected Results:**
- [ ] Sprint status changes to "active"
- [ ] Start date locked
- [ ] Sprint appears in "Active Sprints" section
- [ ] Burndown chart initializes

#### Test 3.5: Sprint Burndown
**Steps:**
1. Mark some cards as "Done"
2. Navigate to Sprint > Analytics
3. Observe burndown chart

**Expected Results:**
- [ ] Chart shows ideal burndown line (straight diagonal)
- [ ] Chart shows actual burndown (stepped line)
- [ ] Remaining points decrease as cards complete
- [ ] Chart updates in real-time

#### Test 3.6: Complete Sprint
**Steps:**
1. Mark all sprint cards as done
2. Click "Complete Sprint"
3. Review sprint summary

**Expected Results:**
- [ ] Sprint status changes to "completed"
- [ ] Velocity calculated (completed points / planned points)
- [ ] Sprint locked (no further edits)
- [ ] Incomplete cards moved to backlog

---

### 👥 Feature 4: Resource Allocation

#### Test 4.1: View Team Resources
**Steps:**
1. Navigate to Resources tab
2. View team capacity visualization

**Expected Results:**
- [ ] Bar chart shows each team member
- [ ] Utilization % displayed (0-100%+)
- [ ] Color coding:
  - Green: <70% (available)
  - Yellow: 70-90% (busy)
  - Red: >90% (overallocated)

#### Test 4.2: Resource Allocation
**Steps:**
1. Assign multiple cards to User 2
2. Ensure total story points > capacity
3. Observe utilization chart

**Expected Results:**
- [ ] User 2 shows >100% utilization (red)
- [ ] Overload warning appears
- [ ] Recommendation: "Reassign tasks or increase capacity"

#### Test 4.3: Skills Matrix
**Steps:**
1. Add skills to team members:
   - User 1: React, Node.js, Project Management
   - User 2: React, TypeScript, Testing
   - User 3: UI/UX, Figma, CSS
2. View skills heatmap

**Expected Results:**
- [ ] Skills displayed in grid
- [ ] Color intensity shows proficiency
- [ ] Can filter tasks by required skills

#### Test 4.4: Availability Calendar
**Steps:**
1. Navigate to Availability tab
2. User 2: Submit time-off request
   - Type: Vacation
   - Dates: Next week Monday-Friday
   - Reason: "Annual leave"
3. User 1 (admin): Approve request

**Expected Results:**
- [ ] Calendar shows time-off blocks
- [ ] Request status: pending → approved
- [ ] Team capacity adjusts for time-off
- [ ] Upcoming time-off list updates
- [ ] Email notification sent (if configured)

**Time-Off Types Test:**
- [ ] Create "Sick Leave" request
- [ ] Create "Personal" request
- [ ] Create "Holiday" entry
- [ ] Create "Conference" entry

---

### 📊 Feature 5: Interactive Gantt Charts

#### Test 5.1: Create Gantt Tasks
**Steps:**
1. Navigate to Gantt Chart tab
2. Add tasks with dependencies:
   - Task A: "Database Schema" (5 days, no dependencies)
   - Task B: "API Development" (7 days, depends on A)
   - Task C: "Frontend Integration" (5 days, depends on B)
   - Task D: "Testing" (3 days, depends on C)

**Expected Results:**
- [ ] Tasks appear on timeline
- [ ] Task bars show duration
- [ ] Dependencies shown as arrows
- [ ] Critical path highlighted

#### Test 5.2: Gantt Interactions
**Steps:**
1. Drag Task A to extend duration
2. Move Task B to different dates
3. Observe dependency updates
4. Edit task details

**Expected Results:**
- [ ] Task duration updates on drag
- [ ] Dependent tasks adjust automatically
- [ ] Progress bar shows completion %
- [ ] Timeline scrolls horizontally

#### Test 5.3: Critical Path Analysis
**Steps:**
1. Mark some tasks as completed
2. Observe critical path recalculation

**Expected Results:**
- [ ] Critical path highlighted in red/bold
- [ ] Non-critical tasks shown in normal color
- [ ] Project end date calculated
- [ ] Slack time calculated for non-critical tasks

---

### 🔔 Feature 6: Team Collaboration & Notifications

#### Test 6.1: Notification Center
**Setup:** Two users logged in

**Steps:**
1. User 1: Assign card to User 2
2. User 2: Check notification center (bell icon)
3. User 1: Comment on card with @dev1 mention
4. User 2: Check notifications again
5. User 2: Click notification

**Expected Results:**
- [ ] Badge counter shows unread count
- [ ] Assignment notification appears
- [ ] Mention notification appears
- [ ] Click navigates to card
- [ ] Notification marked as read
- [ ] Real-time updates (no refresh needed)

**Notification Types Test:**
- [ ] Assignment: "You were assigned to [Card Name]"
- [ ] Mention: "@username mentioned you in [Card Name]"
- [ ] Status change: "[Card Name] moved to Done"
- [ ] Deadline: "[Card Name] is due tomorrow"
- [ ] Comment: "New comment on [Card Name]"

#### Test 6.2: Activity Feed
**Steps:**
1. Navigate to Activity tab
2. Perform various actions:
   - Create card
   - Move card
   - Add comment
   - Assign user
   - Complete task
3. Refresh activity feed

**Expected Results:**
- [ ] All activities logged with timestamps
- [ ] User avatars displayed
- [ ] Activities sorted by time (newest first)
- [ ] Can filter by activity type
- [ ] Can search activities
- [ ] Pagination works for >50 activities

---

### 📈 Feature 7: Real-Time Analytics Dashboard

#### Test 7.1: Sprint Velocity Trends
**Steps:**
1. Navigate to Analytics tab
2. Create and complete 3 sprints with different velocities:
   - Sprint 1: 30 points planned, 25 completed
   - Sprint 2: 35 points planned, 30 completed
   - Sprint 3: 40 points planned, 38 completed
3. View velocity trend chart

**Expected Results:**
- [ ] Bar chart shows planned vs completed points
- [ ] Trend line visible
- [ ] Velocity improving (upward trend)
- [ ] X-axis: Sprint names
- [ ] Y-axis: Story points

#### Test 7.2: Burndown Chart
**Steps:**
1. View active sprint burndown
2. Complete tasks over several days
3. Observe chart updates

**Expected Results:**
- [ ] Ideal line: straight diagonal from start to zero
- [ ] Actual line: stepped, following completions
- [ ] Ahead of schedule: actual below ideal
- [ ] Behind schedule: actual above ideal
- [ ] Chart auto-updates daily

#### Test 7.3: Task Distribution
**Steps:**
1. View pie chart of task distribution
2. Filter by status (To Do, In Progress, Done)

**Expected Results:**
- [ ] Pie chart shows percentages
- [ ] Color coded by status
- [ ] Legend shows counts
- [ ] Click slice to filter
- [ ] Export chart as PNG

#### Test 7.4: Team Performance
**Steps:**
1. View team performance bar chart
2. Each team member shows completed points

**Expected Results:**
- [ ] Bars show points completed per member
- [ ] Sorted by performance
- [ ] Completion rate % displayed
- [ ] Can filter by date range

#### Test 7.5: KPI Cards
**Expected Results:**
- [ ] Active Tasks: Shows current in-progress count
- [ ] Team Velocity: Average points per sprint
- [ ] Completion Rate: % of tasks completed on time
- [ ] Team Size: Current active members

---

### ⏱️ Feature 8: Time Tracking Integration

#### Test 8.1: Start Timer
**Steps:**
1. User 2: Navigate to Time Tracking tab
2. Click "Start Timer"
3. Fill in:
   - Description: "Working on authentication API"
   - Select Card: "Implement user authentication"
   - Billable: Yes
   - Tags: backend, api
4. Click Start

**Expected Results:**
- [ ] Timer starts counting
- [ ] Elapsed time displays (HH:MM:SS)
- [ ] Timer updates every second
- [ ] Timer icon shows "running" state
- [ ] Only one timer can run at a time

#### Test 8.2: Stop Timer
**Steps:**
1. Let timer run for 2-3 minutes
2. Click "Stop Timer"
3. Confirm stop

**Expected Results:**
- [ ] Timer stops
- [ ] Duration saved (in minutes)
- [ ] Entry appears in time entries list
- [ ] Status: "stopped"
- [ ] Description and tags displayed

#### Test 8.3: Manual Time Entry
**Steps:**
1. Click "Add Manual Entry"
2. Fill in:
   - Date: Yesterday
   - Start: 9:00 AM
   - End: 11:30 AM
   - Description: "Design review meeting"
   - Card: Optional
   - Billable: No
3. Save

**Expected Results:**
- [ ] Duration auto-calculated (150 minutes)
- [ ] Entry added to list
- [ ] Can edit entry
- [ ] Can delete entry

#### Test 8.4: Time Entry Approval
**Setup:** User 2 logs time, User 1 approves

**Steps:**
1. User 2: Submit 5 time entries
2. User 1: Navigate to Time Entries (Admin view)
3. User 1: Review entries
4. User 1: Approve 3 entries, Reject 2

**Expected Results:**
- [ ] Entries show "pending" status
- [ ] Admin can see all team entries
- [ ] Approve button changes status to "approved"
- [ ] Reject shows reason input
- [ ] User 2 sees approval status
- [ ] Approved entries locked (no edit)

#### Test 8.5: Time Reports
**Steps:**
1. Navigate to Time Report tab
2. Select date range: Last 30 days
3. Group by: User
4. Filter: Billable only
5. Click "Generate Report"

**Expected Results:**
- [ ] Report shows total hours per user
- [ ] Billable vs non-billable breakdown
- [ ] Chart visualization
- [ ] Export to CSV works
- [ ] Can group by: User, Card, Project, Date
- [ ] Can filter by tags

---

### 🎨 Feature 9: Custom Fields & Forms

#### Test 9.1: Create Custom Fields
**Steps:**
1. Navigate to Custom Fields tab
2. Create field: "Client Name"
   - Type: Text
   - Required: Yes
   - Applies to: Projects
   - Validation: Min 3 chars
3. Create field: "Budget"
   - Type: Number
   - Validation: Min 0, Max 1000000
   - Applies to: Projects
4. Create field: "Launch Date"
   - Type: Date
   - Applies to: Projects
5. Create field: "Technology Stack"
   - Type: Multi-select
   - Options: React, Node.js, MongoDB, Redis, TypeScript
   - Applies to: Cards

**Expected Results:**
- [ ] All 11 field types available:
  - Text, Number, Date, Select, Multi-select
  - Checkbox, URL, Email, Phone, File, Calculated
- [ ] Fields save with validation rules
- [ ] Can reorder fields (drag & drop)
- [ ] Can duplicate field
- [ ] Can delete field (with confirmation)

#### Test 9.2: Conditional Logic
**Steps:**
1. Create field: "Requires Design"
   - Type: Checkbox
   - Applies to: Cards
2. Create field: "Designer Assigned"
   - Type: Select
   - Options: List of designers
   - Conditional: Show only if "Requires Design" = true
3. Test the condition

**Expected Results:**
- [ ] "Designer Assigned" hidden by default
- [ ] Appears when checkbox checked
- [ ] Hides when checkbox unchecked
- [ ] Validation works with conditions

#### Test 9.3: Calculated Fields
**Steps:**
1. Create field: "Total Cost"
   - Type: Calculated
   - Formula: "Budget * 1.2" (20% overhead)
   - Applies to: Projects
2. Enter budget value
3. Observe calculation

**Expected Results:**
- [ ] Calculated field auto-updates
- [ ] Formula validates before save
- [ ] Can reference other fields
- [ ] Read-only (cannot edit directly)

#### Test 9.4: Use Custom Fields
**Steps:**
1. Create new project
2. Fill in custom fields
3. Save project
4. View project details

**Expected Results:**
- [ ] Custom fields appear in form
- [ ] Validation works (required, min/max)
- [ ] Values save correctly
- [ ] Display in project view
- [ ] Can edit values later

---

### 🏆 Feature 10: Story Point Poker (Detailed)

#### Test 10.1: Create Poker Session
**Setup:** 3 users in 3 browser windows

**Steps:**
1. User 1 (facilitator): Go to Planning Poker
2. Select card: "Implement payment gateway"
3. Click "Start Poker Session"
4. Share session link with team

**Expected Results:**
- [ ] Session created with unique ID
- [ ] Facilitator sees "Waiting for participants"
- [ ] Session shareable via link

#### Test 10.2: Join Session
**Steps:**
1. User 2 & User 3: Open session link
2. Observe participant list

**Expected Results:**
- [ ] All 3 users appear in participant list
- [ ] Avatars and names displayed
- [ ] "Not voted" status for each user
- [ ] Real-time participant count

#### Test 10.3: Voting Process
**Steps:**
1. All users select story points:
   - User 1: 5
   - User 2: 8
   - User 3: 5
2. Observe voting status
3. Facilitator clicks "Reveal Votes"

**Expected Results:**
- [ ] Vote selections hidden from others
- [ ] User status changes to "Voted" (no point visible)
- [ ] Reveal shows all votes simultaneously
- [ ] Average: 6 (rounds to nearest Fibonacci: 5 or 8)
- [ ] Consensus: "Close" or "Divergent"
- [ ] Fibonacci cards: 0,1,2,3,5,8,13,21,34,55,89
- [ ] Special cards: ?, ☕

#### Test 10.4: Consensus Detection
**Test scenarios:**
- [ ] All same vote → "Perfect consensus"
- [ ] Within 1 Fibonacci number → "Good consensus"
- [ ] >2 numbers apart → "Divergent - discuss!"

#### Test 10.5: Re-vote
**Steps:**
1. After reveal, click "Discuss"
2. Team discusses (chat/video)
3. Click "Re-vote"
4. Vote again

**Expected Results:**
- [ ] Votes reset
- [ ] Can vote again
- [ ] History preserved
- [ ] Can see previous round results

#### Test 10.6: Accept Points
**Steps:**
1. Facilitator clicks "Accept and Assign"
2. Select final point value: 5
3. Confirm

**Expected Results:**
- [ ] Card updated with 5 story points
- [ ] Card marked as estimated
- [ ] Session ends
- [ ] Can start new session for next card

---

### ⚠️ Feature 11: Risk & Bottleneck Detection

#### Test 11.1: Risk Dashboard
**Steps:**
1. Navigate to Risk & Bottlenecks tab
2. View overall risk score

**Expected Results:**
- [ ] Risk score: 0-100
- [ ] Color coding:
  - Green: 0-30 (low risk)
  - Yellow: 31-60 (medium risk)
  - Red: 61-100 (high risk)

#### Test 11.2: Risk Indicators
**Create risk scenarios:**

**Overdue Tasks:**
1. Create card with due date = yesterday
2. Leave in "In Progress"
3. Check risk dashboard

**Expected Results:**
- [ ] "Overdue Tasks" indicator shows: HIGH
- [ ] Count of overdue tasks: 1
- [ ] Recommendation: "Review and reprioritize overdue items"

**Blocked Tasks:**
1. Mark card as "Blocked"
2. Add blocker reason
3. Leave for >3 days

**Expected Results:**
- [ ] "Blocked Tasks" indicator shows: CRITICAL
- [ ] Days blocked: 3+
- [ ] Recommendation: "Unblock [Card Name] - blocked for 3 days"

**Velocity Drop:**
1. Complete Sprint 1: 30 points
2. Complete Sprint 2: 20 points (33% drop)

**Expected Results:**
- [ ] "Velocity Decline" indicator shows: MEDIUM
- [ ] Percentage drop displayed
- [ ] Recommendation: "Team velocity decreased 33%"

**Resource Overallocation:**
1. Assign >100% capacity to User 2

**Expected Results:**
- [ ] "Resource Overload" indicator shows: HIGH
- [ ] User name and % shown
- [ ] Recommendation: "User 2 at 120% - reassign tasks"

**Aging Tasks:**
1. Keep card in "In Progress" for >5 days

**Expected Results:**
- [ ] "Aging Tasks" indicator shows: MEDIUM
- [ ] Days in progress: 5+
- [ ] Recommendation: "Card aging in progress column"

#### Test 11.3: Bottleneck Analysis
**Steps:**
1. View bottleneck table
2. Add many cards to "In Progress" column (exceed WIP limit)

**Expected Results:**
- [ ] Columns ranked by bottleneck severity
- [ ] WIP limit exceeded shown in red
- [ ] Average card age calculated
- [ ] Blocked card count per column
- [ ] Recommendations:
  - "Reduce WIP in In Progress (10/5)"
  - "Address 3 blocked cards in Testing"

---

### 📅 Feature 12: Team Availability Calendar

#### Test 12.1: Calendar View
**Steps:**
1. Navigate to Availability tab
2. View team calendar for current month

**Expected Results:**
- [ ] Calendar grid with all team members
- [ ] Color-coded availability:
  - Green: Available
  - Orange: Partially available
  - Red: Unavailable/Off
- [ ] Hover shows details

#### Test 12.2: Request Time Off
**Steps:**
1. User 2: Click date on calendar
2. Select "Request Time Off"
3. Fill in:
   - Type: Vacation
   - Start: Next Monday
   - End: Next Friday
   - Reason: "Family trip"
4. Submit request

**Expected Results:**
- [ ] Request created with status "pending"
- [ ] Appears in "Upcoming Time Off" list
- [ ] Calendar shows tentative block (orange)
- [ ] Email notification sent to approvers

**Time-Off Types:**
- [ ] Vacation (green)
- [ ] Sick Leave (red)
- [ ] Personal (blue)
- [ ] Holiday (purple)
- [ ] Conference (orange)

#### Test 12.3: Approve/Reject Time Off
**Steps:**
1. User 1 (admin): View pending requests
2. Click on User 2's vacation request
3. Review details
4. Click "Approve"

**Expected Results:**
- [ ] Status changes to "approved"
- [ ] Calendar block turns solid (no longer tentative)
- [ ] User 2 gets approval notification
- [ ] Team capacity chart updates
- [ ] Cannot approve overlapping requests

**Reject Test:**
- [ ] Click "Reject"
- [ ] Enter reason: "Project deadline conflict"
- [ ] User 2 gets rejection notification with reason

#### Test 12.4: Team Capacity Impact
**Steps:**
1. Approve time-off for 2 team members same week
2. View team capacity for that week
3. Try to assign work during that period

**Expected Results:**
- [ ] Capacity reduced by time-off
- [ ] Warning when assigning work
- [ ] Suggestion to reschedule or reassign
- [ ] Visual indicator on sprint capacity

---

### ⚡ Feature 13: Workflow Automation

#### Test 13.1: Create Automation Rule
**Steps:**
1. Navigate to Automation tab
2. Click "Create Rule"
3. Configure:
   - Name: "Auto-assign new bugs to lead"
   - Trigger: "Card created"
   - Conditions:
     - Label contains "bug"
   - Actions:
     - Assign user: User 1
     - Add label: "needs-triage"
     - Send notification: User 1
4. Enable rule

**Expected Results:**
- [ ] Rule created and active
- [ ] Execution count: 0
- [ ] Last executed: Never

**Trigger Types (8 total):**
- [ ] card_created
- [ ] card_moved
- [ ] card_updated
- [ ] status_changed
- [ ] assignee_changed
- [ ] due_date_approaching
- [ ] sprint_started
- [ ] sprint_completed

**Action Types (7 total):**
- [ ] assign_user
- [ ] change_status
- [ ] add_label
- [ ] send_notification
- [ ] move_column
- [ ] add_comment
- [ ] change_priority

#### Test 13.2: Trigger Automation
**Steps:**
1. Create new card with label "bug"
2. Observe automation execution

**Expected Results:**
- [ ] Card automatically assigned to User 1
- [ ] Label "needs-triage" added
- [ ] User 1 receives notification
- [ ] Automation execution count increments
- [ ] Last executed timestamp updates
- [ ] Execution appears in automation logs

#### Test 13.3: Complex Rule (Multiple Conditions)
**Steps:**
1. Create rule: "Escalate critical overdue tasks"
2. Trigger: "Card updated"
3. Conditions:
   - Priority = "critical"
   - Status != "done"
   - Due date < today
4. Actions:
   - Change priority to "critical"
   - Assign to: Project Manager
   - Send notification: All team
   - Add comment: "⚠️ Critical task overdue - needs immediate attention"

**Expected Results:**
- [ ] All conditions must be true to trigger
- [ ] Multiple actions execute in sequence
- [ ] Each action completes before next

#### Test 13.4: Disable/Enable Rules
**Steps:**
1. Disable "Auto-assign new bugs" rule
2. Create new bug card
3. Observe no automation runs
4. Enable rule again
5. Create another bug card

**Expected Results:**
- [ ] Disabled rule shows gray toggle
- [ ] No execution when disabled
- [ ] Execution count doesn't change
- [ ] Works again when re-enabled

---

### 🔗 Feature 14: Webhook Integrations

#### Test 14.1: Create Webhook
**Steps:**
1. Navigate to Webhooks tab
2. Click "Create Webhook"
3. Configure:
   - Name: "Slack Notification"
   - URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   - Events: card.created, card.moved, sprint.completed
   - Secret: Generate random secret
   - Custom Headers:
     - Content-Type: application/json
4. Save webhook

**Expected Results:**
- [ ] Webhook created
- [ ] URL validated (must be HTTPS)
- [ ] Secret stored securely
- [ ] Enabled by default
- [ ] Trigger count: 0

**Event Types (9+):**
- [ ] card.created
- [ ] card.updated
- [ ] card.moved
- [ ] card.deleted
- [ ] sprint.started
- [ ] sprint.completed
- [ ] comment.added
- [ ] member.added
- [ ] project.updated

#### Test 14.2: Test Webhook
**Steps:**
1. Click "Test Webhook" button
2. View test payload
3. Send test

**Expected Results:**
- [ ] Test payload sent to URL
- [ ] Response received and logged
- [ ] Status code displayed (200 = success)
- [ ] Response time shown
- [ ] HMAC signature included in headers:
  ```
  X-Webhook-Signature: sha256=abcd1234...
  ```

#### Test 14.3: Webhook Execution
**Steps:**
1. Perform actions that trigger webhook:
   - Create card
   - Move card
   - Complete sprint
2. Check webhook logs

**Expected Results:**
- [ ] Webhook fires for subscribed events
- [ ] Execution logged with:
  - Timestamp
  - Event type
  - Status code
  - Response time
  - Error message (if failed)
- [ ] Retry on failure (up to 3 times)
- [ ] Success rate calculated

#### Test 14.4: Webhook Payload Verification
**Sample payload:**
```json
{
  "event": "card.created",
  "timestamp": "2025-11-19T10:30:00Z",
  "data": {
    "card": {
      "_id": "...",
      "title": "New task",
      "status": "todo",
      "assignee": "..."
    },
    "user": {
      "id": "...",
      "name": "John Doe"
    }
  }
}
```

**Expected:**
- [ ] Valid JSON
- [ ] All fields present
- [ ] Signature verification passes
- [ ] Timestamp within 5 minutes (prevents replay attacks)

#### Test 14.5: Webhook Monitoring
**Steps:**
1. View webhook execution logs
2. Filter by status (success/failed)
3. View failure details

**Expected Results:**
- [ ] Logs paginated (50 per page)
- [ ] Can filter by date range
- [ ] Failed requests show error details
- [ ] Success rate percentage displayed
- [ ] Can retry failed requests manually

---

### 📅 Feature 15: Scheduled Tasks (Cron Automation)

#### Test 15.1: Create Scheduled Task
**Steps:**
1. Navigate to Scheduled Tasks tab
2. Click "Create Task"
3. Configure:
   - Name: "Daily standup reminder"
   - Schedule: "0 9 * * 1-5" (9 AM weekdays)
   - Action: Send notification
   - Timezone: America/New_York
   - Enabled: Yes
4. Save

**Expected Results:**
- [ ] Task created
- [ ] Next run time calculated and displayed
- [ ] Cron expression validated
- [ ] Timezone applied

**Cron Presets:**
- [ ] Every weekday at 9 AM: `0 9 * * 1-5`
- [ ] Daily at midnight: `0 0 * * *`
- [ ] Weekly on Sunday: `0 0 * * 0`
- [ ] Monthly on 1st: `0 0 1 * *`
- [ ] Every 15 minutes: `*/15 * * * *`
- [ ] Every 2 hours: `0 */2 * * *`

#### Test 15.2: Action Types
**Create tasks for each action type:**

**1. Create Card:**
- Action: create_card
- Parameters: { title: "Daily review", columnId: "todo" }
- Schedule: Daily at 8 AM

**2. Send Report:**
- Action: send_report
- Parameters: { reportType: "velocity", recipients: ["pm@test.com"] }
- Schedule: Weekly on Friday 5 PM

**3. Update Sprint:**
- Action: update_sprint
- Parameters: { sprintId: "...", action: "calculate_velocity" }
- Schedule: Daily at midnight

**4. Send Notification:**
- Action: send_notification
- Parameters: { message: "Standup in 15 minutes!", recipients: "all" }
- Schedule: Weekdays at 8:45 AM

**5. Run Automation:**
- Action: run_automation
- Parameters: { automationRuleId: "..." }
- Schedule: Every hour

**Expected Results:**
- [ ] Each action type works correctly
- [ ] Parameters validated before save
- [ ] Execution logged

#### Test 15.3: Run Task Immediately
**Steps:**
1. Select a scheduled task
2. Click "Run Now" button
3. Confirm action

**Expected Results:**
- [ ] Task executes immediately
- [ ] Run count increments
- [ ] Last run timestamp updates
- [ ] Next run time unchanged
- [ ] Execution appears in logs

#### Test 15.4: Execution Monitoring
**Steps:**
1. Wait for scheduled time
2. Check execution logs
3. View task details

**Expected Results:**
- [ ] Task runs at scheduled time (±1 minute)
- [ ] Run count increments
- [ ] Next run time calculated
- [ ] Failure count updates if error
- [ ] Can view execution history

#### Test 15.5: Enable/Disable Task
**Steps:**
1. Disable task
2. Wait past scheduled time
3. Verify no execution
4. Enable task again

**Expected Results:**
- [ ] Disabled task doesn't execute
- [ ] Next run shown as "Disabled"
- [ ] Re-enabling recalculates next run
- [ ] No missed executions when re-enabled

#### Test 15.6: Timezone Handling
**Steps:**
1. Create task in UTC timezone
2. Create same task in America/New_York
3. Compare next run times

**Expected Results:**
- [ ] Times correctly offset by timezone
- [ ] DST handled automatically
- [ ] Display shows user's local time

---

### 🤖 Feature 16: AI-Powered Insights

**⚠️ Prerequisites:**
- OpenAI API key configured
- Or OpenRouter API key
- Sufficient API credits

#### Test 16.1: Sprint Prediction
**Setup:** Active sprint with 50% completion

**Steps:**
1. Navigate to AI Insights tab
2. Click "Sprint Prediction" sub-tab
3. Click "Predict Sprint Completion"
4. Wait for AI response (~3-5 seconds)

**Expected Results:**
- [ ] Prediction shown: "yes" / "at-risk" / "no"
- [ ] Confidence score: 0-100%
- [ ] Estimated completion date
- [ ] 3-5 recommended actions:
  - e.g., "Reduce scope by 5 points"
  - e.g., "Pair programming for blocked tasks"
  - e.g., "Daily standup to track progress"
- [ ] Color-coded by risk level

**Test Scenarios:**
- [ ] Sprint on track → "yes" with 80%+ confidence
- [ ] Sprint slightly behind → "at-risk" with 60% confidence
- [ ] Sprint far behind → "no" with high confidence

#### Test 16.2: Automated Retrospectives
**Setup:** Completed sprint with mix of success and issues

**Steps:**
1. Go to "Retrospective" tab
2. Click "Generate Retrospective Insights"
3. Wait for AI analysis

**Expected Results:**
- [ ] "What Went Well" section (3+ items):
  - e.g., "High velocity of 38 points completed"
  - e.g., "Zero critical bugs in production"
- [ ] "What Could Improve" section (3+ items):
  - e.g., "3 tasks blocked for >2 days"
  - e.g., "Code review turnaround time increased"
- [ ] "Action Items" section (3+ items):
  - e.g., "Implement WIP limits in testing column"
  - e.g., "Schedule daily 15-min unblock meetings"
- [ ] Team Sentiment: "positive" / "neutral" / "negative"
- [ ] Sentiment color-coded

#### Test 16.3: Natural Language Task Generation
**Steps:**
1. Go to "Generate Tasks" tab
2. Enter description:
   ```
   I need to build a user registration system with email verification,
   password reset, and social login (Google, GitHub). It should have
   rate limiting and security best practices.
   ```
3. Click "Generate Tasks"

**Expected Results:**
- [ ] 5-8 tasks generated
- [ ] Each task has:
  - Title: Brief, actionable
  - Description: Detailed, specific
  - Priority: low/medium/high/critical
  - Estimated Points: 1-13 (Fibonacci)
  - Dependencies: Referenced by title
- [ ] Example tasks:
  - "Setup authentication database schema" (8 pts, high)
  - "Implement JWT token generation" (5 pts, high, depends on schema)
  - "Create email verification flow" (5 pts, medium)
  - "Add rate limiting middleware" (3 pts, medium)
  - "Integrate Google OAuth" (5 pts, medium)
- [ ] "Create" button to add to backlog

#### Test 16.4: Meeting Summarization
**Steps:**
1. Go to "Meeting Summary" tab (if available)
2. Paste meeting transcript:
   ```
   John: Let's discuss the authentication bug. It's blocking 3 tasks.
   Sarah: I'll take a look today. Probably a JWT expiration issue.
   Mike: We also need to plan the next sprint. I suggest 40 points.
   John: Agreed. Sarah, can you lead the retrospective on Friday?
   Sarah: Yes, I'll prepare a template.
   ```
3. Click "Summarize Meeting"

**Expected Results:**
- [ ] Summary: 2-3 sentence overview
- [ ] Key Points:
  - "Authentication bug blocking 3 tasks"
  - "JWT expiration suspected as cause"
  - "Next sprint planned for 40 points"
- [ ] Action Items:
  - Task: "Investigate JWT expiration bug"
    Assignee: Sarah
    Due: Today
  - Task: "Prepare retrospective template"
    Assignee: Sarah
    Due: Friday
- [ ] Decisions:
  - "Sprint capacity set to 40 points"
  - "Sarah to lead Friday retrospective"

#### Test 16.5: AI Risk Prediction
**Steps:**
1. Go to "Risk Analysis" tab
2. Click "Predict Project Risks"
3. Wait for analysis

**Expected Results:**
- [ ] Overall Risk Score: 0-100
  - 0-30: Green (Low)
  - 31-60: Yellow (Medium)
  - 61-100: Red (High)
- [ ] Individual Risks (3-6):
  - Type: "Resource Constraint"
    Severity: high
    Probability: 75%
    Impact: "2 developers at 110% capacity"
    Mitigation: "Hire contractor or reduce scope by 15 points"
  - Type: "Technical Debt"
    Severity: medium
    Probability: 60%
    Impact: "Test coverage below 50%"
    Mitigation: "Allocate 20% time to testing in next sprint"
- [ ] Risks sorted by severity
- [ ] Progress bars for probability
- [ ] Expandable mitigation strategies

#### Test 16.6: Resource Optimization
**Setup:** Project with unbalanced workload

**Steps:**
1. Click "Optimize Resources"
2. Provide current resource data:
   ```json
   {
     "resources": [
       { "name": "Alice", "currentLoad": 120, "skills": ["React", "TypeScript"] },
       { "name": "Bob", "currentLoad": 60, "skills": ["Node.js", "MongoDB"] },
       { "name": "Carol", "currentLoad": 85, "skills": ["React", "Node.js"] }
     ],
     "tasks": [...]
   }
   ```
3. Get recommendations

**Expected Results:**
- [ ] Recommendations for each overloaded resource:
  - Resource: "Alice"
    Current Load: 120%
    Recommended Load: 85%
    Reassignments:
      - "Implement user profile page" from Alice to Carol
        Reason: "Carol has React skills and 35% availability"
      - "Add unit tests" from Alice to Bob
        Reason: "Bob has 40% availability"
- [ ] Efficiency Score: 0-100
  - Before: 65
  - After: 82
- [ ] Visual load distribution chart

#### Test 16.7: AI Chat Assistant
**Steps:**
1. Go to "AI Assistant" tab
2. Chat interface with conversation history
3. Ask questions:
   - "What's the current sprint velocity?"
   - "Which team member has the most tasks?"
   - "Suggest improvements for our workflow"
   - "How can I reduce the number of blocked tasks?"

**Expected Results:**
- [ ] Chat bubble interface
- [ ] Messages alternate left (user) and right (AI)
- [ ] Context-aware responses:
  - Uses current project data
  - References sprint and team info
- [ ] Actionable suggestions
- [ ] Can ask follow-up questions
- [ ] Conversation history preserved during session

**Error Handling:**
- [ ] API key missing → Clear error message
- [ ] Rate limit exceeded → Retry message
- [ ] Invalid response → Fallback message
- [ ] Network error → Connection issue message

---

### 📱 Feature 17: Offline Mode & Progressive Web App

#### Test 17.1: ServiceWorker Registration
**Steps:**
1. Open Chrome DevTools > Application > Service Workers
2. Refresh the page
3. Check ServiceWorker status

**Expected Results:**
- [ ] ServiceWorker registered successfully
- [ ] Status: "activated and is running"
- [ ] Scope: `/`
- [ ] Console logs: "[ServiceWorker] Install event"
- [ ] Console logs: "[ServiceWorker] Activate event"

#### Test 17.2: Cache Storage
**Steps:**
1. DevTools > Application > Cache Storage
2. Browse cached assets

**Expected Results:**
- [ ] Two caches present:
  - `realtime-pm-v1` (static assets)
  - `realtime-pm-runtime-v1` (dynamic content)
- [ ] Static cache contains:
  - `/` (homepage)
  - `/offline.html`
- [ ] Runtime cache contains:
  - API responses (GET requests)
  - Recently loaded pages

#### Test 17.3: IndexedDB Storage
**Steps:**
1. DevTools > Application > IndexedDB
2. Expand `RealtimePM` database
3. Check object stores

**Expected Results:**
- [ ] Database version: 1
- [ ] 5 object stores:
  - boards
  - cards
  - sprints
  - projects
  - syncQueue
- [ ] Each store has appropriate indexes
- [ ] Data populated after using app

#### Test 17.4: Work Offline
**Setup:** Use app online first to cache data

**Steps:**
1. Load project with boards and cards
2. Wait for data to cache (~5 seconds)
3. DevTools > Network > Offline (checkbox)
4. Refresh page
5. Try to navigate and interact

**Expected Results:**
- [ ] Page loads from cache
- [ ] Cached boards display correctly
- [ ] Cached cards visible
- [ ] Can view card details
- [ ] Offline indicator appears (optional)
- [ ] `/offline.html` shown for uncached routes

#### Test 17.5: Create/Edit Offline
**Steps:**
1. Go offline (Network > Offline)
2. Create new card:
   - Title: "Offline created task"
   - Description: "Testing offline functionality"
3. Edit existing card:
   - Change title to "Modified offline"
4. Move card to different column
5. Add comment to card

**Expected Results:**
- [ ] All actions work smoothly
- [ ] Changes stored in IndexedDB
- [ ] syncQueue table populated with pending changes
- [ ] Visual indicator for "pending sync" (optional)
- [ ] No error messages

#### Test 17.6: Sync When Online
**Steps:**
1. Perform offline actions (create, edit, move cards)
2. Check syncQueue in IndexedDB (should have 3-4 items)
3. Go back online (uncheck Offline)
4. Wait 3-5 seconds
5. Check syncQueue again

**Expected Results:**
- [ ] Automatic sync triggered on reconnection
- [ ] Console logs: "App is online"
- [ ] syncQueue items processed
- [ ] Successful syncs removed from queue
- [ ] Server has latest data
- [ ] IndexedDB updated with server IDs
- [ ] Real-time updates resume

#### Test 17.7: Offline Page
**Steps:**
1. Go offline
2. Navigate to uncached route: /some-random-page
3. View offline page

**Expected Results:**
- [ ] Beautiful offline page displayed
- [ ] Clear message: "You're Offline"
- [ ] Lists what you can do offline:
  - View cached boards
  - Create/edit tasks
  - Browse sprint data
- [ ] "Retry Connection" button
- [ ] Auto-detects when online (every 5s check)
- [ ] Auto-redirects when connection restored

#### Test 17.8: PWA Installation
**Desktop (Chrome):**
**Steps:**
1. Visit app in Chrome
2. Look for install button in address bar (⊕ icon)
3. Click "Install"

**Expected Results:**
- [ ] Install prompt appears
- [ ] App name: "Realtime Project Management"
- [ ] After install: Desktop shortcut created
- [ ] Opens in standalone window (no browser chrome)
- [ ] Has app icon

**Mobile (Android/iOS):**
**Steps:**
1. Visit app in mobile browser
2. Menu > "Add to Home Screen"
3. Install app

**Expected Results:**
- [ ] App icon on home screen
- [ ] Opens fullscreen (no browser UI)
- [ ] Splash screen on launch
- [ ] Appears in app drawer

#### Test 17.9: Background Sync
**Steps:**
1. Create card offline
2. Close app
3. Go online
4. Reopen app after 1 minute

**Expected Results:**
- [ ] Background sync triggers (if supported)
- [ ] Card synced to server
- [ ] No user action required
- [ ] Sync notification (optional)

**Note:** Background Sync support varies by browser

#### Test 17.10: Push Notifications (Optional)
**Steps:**
1. Grant notification permission
2. Register for push notifications
3. Trigger notification from server:
   - Card assigned
   - Sprint started
   - Comment added

**Expected Results:**
- [ ] Permission prompt appears
- [ ] Notification received even when app closed
- [ ] Click notification opens relevant page
- [ ] Notification badge on app icon
- [ ] Can dismiss notification

---

### 🎥 Feature 18: Video & Screen Sharing (WebRTC)

#### Test 18.1: Join Video Room
**Steps:**
1. Navigate to Video Call tab
2. Grant camera/microphone permissions
3. Observe local video

**Expected Results:**
- [ ] Permission prompt for camera + mic
- [ ] Local video appears in PiP (bottom-right)
- [ ] Video is mirrored (selfie view)
- [ ] "You" label displayed
- [ ] Participant count: 1

#### Test 18.2: Multi-User Video Call
**Setup:** 3 browser windows (or devices)

**Steps:**
1. All users navigate to Video Call tab (same roomId/projectId)
2. All grant permissions
3. Observe video feeds

**Expected Results:**
- [ ] All users see each other's video
- [ ] Grid layout: 3 video tiles
- [ ] Each tile shows user name
- [ ] Connection time < 3 seconds
- [ ] Smooth video playback (no freezing)
- [ ] Audio works bidirectionally

**Connection Process (in DevTools Console):**
- [ ] `[WebRTC] User joined: user2`
- [ ] `[WebRTC] Received offer from: user2`
- [ ] `[WebRTC] Received ICE candidate`
- [ ] Connection state: connecting → connected

#### Test 18.3: Audio Controls
**Steps:**
1. Click microphone button (mute)
2. Speak
3. Other users verify no audio
4. Click again to unmute
5. Verify audio restored

**Expected Results:**
- [ ] Button toggles: AudioOutlined ↔ AudioMutedOutlined
- [ ] Button color changes (gray → red when muted)
- [ ] Audio track enabled/disabled
- [ ] Visual indicator on tile (muted icon)
- [ ] Toast message: "Microphone muted/enabled"

#### Test 18.4: Video Controls
**Steps:**
1. Click camera button (disable)
2. Observe local and remote views
3. Click again to enable

**Expected Results:**
- [ ] Local video replaced with avatar placeholder
- [ ] Remote users see avatar instead of video
- [ ] Button color changes
- [ ] Video track disabled
- [ ] Toast message: "Camera disabled/enabled"
- [ ] Re-enabling restores video

#### Test 18.5: Screen Sharing
**Steps:**
1. Click screen share button (DesktopOutlined)
2. Choose screen/window/tab
3. Confirm share
4. Other users observe screen
5. Click button again to stop

**Expected Results:**
- [ ] Native screen picker dialog appears
- [ ] Options:
  - Entire screen
  - Application window
  - Browser tab
- [ ] Cursor visible on shared screen
- [ ] Remote users see screen (high quality)
- [ ] Local video switches to screen
- [ ] Button highlighted when sharing
- [ ] Stop sharing: returns to camera
- [ ] Toast messages for start/stop

**Screen Share Ended:**
- [ ] Browser "Stop sharing" button ends share
- [ ] App detects end and toggles button
- [ ] Returns to camera automatically

#### Test 18.6: WebRTC Signaling
**Steps:**
1. Open DevTools > Network > WS (WebSocket)
2. Join video call
3. Observe signaling messages

**Expected Results:**
- [ ] `webrtc:join-room` sent to server
- [ ] `webrtc:user-joined` received from server
- [ ] `webrtc:offer` exchanged
- [ ] `webrtc:answer` exchanged
- [ ] `webrtc:ice-candidate` (multiple) exchanged
- [ ] All messages in < 100ms

**ICE Candidates:**
- [ ] Multiple candidates generated
- [ ] Types: host, srflx (STUN), relay (TURN)
- [ ] Google STUN servers used: `stun:stun.l.google.com:19302`

#### Test 18.7: Connection Quality
**Test with network throttling:**

**Steps:**
1. DevTools > Network > Throttling
2. Select "Fast 3G" or "Slow 3G"
3. Join video call
4. Observe quality

**Expected Results:**
- [ ] Video quality adapts to bandwidth
- [ ] Some pixelation on slow connections
- [ ] Audio prioritized over video
- [ ] No disconnections
- [ ] Auto-reconnection if brief disconnect

**Stats (optional):**
- [ ] Can view connection stats:
  - Bitrate
  - Packet loss
  - Round-trip time
  - Video resolution

#### Test 18.8: User Leave/Disconnect
**Steps:**
1. User 3: Close browser tab
2. Users 1 & 2: Observe

**Expected Results:**
- [ ] User 3's video tile disappears
- [ ] Participant count decrements
- [ ] Grid re-layouts (2 users)
- [ ] No errors in console
- [ ] Peer connection closes gracefully

#### Test 18.9: Leave Call
**Steps:**
1. Click "Leave Call" button (red phone icon)
2. Confirm leave

**Expected Results:**
- [ ] All peer connections closed
- [ ] Local stream stopped (camera turns off)
- [ ] WebSocket disconnect: `webrtc:leave-room`
- [ ] Other users notified
- [ ] Redirect or close video view
- [ ] Clean state (can rejoin)

#### Test 18.10: Edge Cases

**Same user, multiple tabs:**
- [ ] User opens 2 tabs
- [ ] Joins same room twice
- [ ] Should see 2 separate connections (browser limitation)

**Rejoin after disconnect:**
- [ ] Leave call
- [ ] Rejoin immediately
- [ ] Connections re-establish

**Camera/Mic denied:**
- [ ] Deny permissions
- [ ] Error message displayed
- [ ] Can join audio-only or video-only
- [ ] Can request permissions again

**Network interruption:**
- [ ] Disconnect WiFi for 5 seconds
- [ ] Reconnect
- [ ] Verify auto-reconnection (may take 10-30s)

---

## Use Case Scenarios

### Scenario 1: New Project Onboarding (30 min)

**Role:** Project Manager (User 1)

**Objective:** Set up a new software project from scratch

**Steps:**
1. **Create Project** (2 min)
   - Login as PM
   - Create project: "E-Commerce Platform MVP"
   - Add description and goals

2. **Set Up Team** (5 min)
   - Invite 3 team members (send invites)
   - Assign roles: 2 Developers, 1 Designer
   - Set team capacity: 40 hours/week each

3. **Create Custom Fields** (5 min)
   - Add "Client Name" field (required)
   - Add "Budget" field (number, min: 0)
   - Add "Technology Stack" (multi-select)
   - Add "Requires Design" (checkbox)

4. **Set Up Board** (3 min)
   - Rename columns: Backlog → Design → Dev → Testing → Done
   - Set WIP limits: Design: 3, Dev: 5, Testing: 3
   - Configure board settings

5. **Create Initial Backlog** (10 min)
   - Use AI: "Generate tasks for an e-commerce platform with product catalog, shopping cart, checkout, and user accounts"
   - Review generated 8 tasks
   - Add to backlog
   - Manually add 2 more tasks:
     - "Setup CI/CD pipeline"
     - "Create design system"

6. **Create First Sprint** (5 min)
   - Sprint name: "Sprint 1 - Foundation"
   - Duration: 2 weeks (today + 14 days)
   - Capacity: 40 points
   - Goal: "Setup infrastructure and authentication"
   - Add 5 tasks from backlog (total: 38 points)

**Verification:**
- [ ] Project created and accessible
- [ ] Team members invited
- [ ] Custom fields working
- [ ] Board configured with 5 columns
- [ ] 10 tasks in backlog
- [ ] Sprint 1 ready to start

---

### Scenario 2: Daily Sprint Management (45 min)

**Role:** Scrum Master (User 1) + 2 Developers (User 2, 3)

**Objective:** Manage a typical day in an active sprint

**Day Activities:**

**Morning (9:00 AM):**
1. **Standup Meeting** (10 min)
   - User 1: Start video call
   - All users join
   - Discuss yesterday's work
   - Identify blockers
   - Use AI: "Summarize meeting" with transcript
   - AI generates action items

2. **Update Board** (5 min)
   - User 2: Move "Implement login API" to "In Progress"
   - User 3: Move "Design homepage mockup" to "Testing"
   - User 1: Mark "Setup MongoDB" as "Done"
   - All updates visible in real-time

3. **Time Tracking** (2 min)
   - User 2: Start timer on "Implement login API"
   - Description: "Working on JWT authentication"
   - Mark as billable

**Midday (12:00 PM):**
4. **Handle Blocker** (10 min)
   - User 3: Mark card as "Blocked"
   - Reason: "Waiting for design review"
   - Risk dashboard shows new blocker
   - User 1: Gets notification
   - User 1: Assigns User 2 to review
   - Automation: Auto-comment "@User2 please review"

5. **Code Review** (5 min)
   - User 2: Completes task
   - Moves to "Testing"
   - Adds comment: "Ready for QA, PR #123"
   - User 3: Gets notification

**Afternoon (3:00 PM):**
6. **Planning Poker** (10 min)
   - New task added: "Implement password reset"
   - User 1: Start poker session
   - All users join
   - Voting: User 1 (5), User 2 (8), User 3 (5)
   - Discuss discrepancy
   - Re-vote: All select 5
   - Accept 5 points

7. **Check Sprint Progress** (3 min)
   - View Analytics dashboard
   - Burndown chart: slightly ahead of ideal
   - Velocity: On track for 38 points
   - Risk score: 25 (low)
   - AI Prediction: "Yes, 85% confidence"

**End of Day (5:00 PM):**
8. **Time Tracking** (2 min)
   - User 2: Stop timer (7h 45min worked)
   - Review time entries
   - Mark as "Ready for Approval"
   - User 1: Approves time entries

**Verification:**
- [ ] Video call worked smoothly
- [ ] AI meeting summary accurate
- [ ] Board updated in real-time
- [ ] Blocker detected and resolved
- [ ] Planning poker consensus reached
- [ ] Sprint metrics accurate
- [ ] Time tracked and approved

---

### Scenario 3: Sprint Planning & Retrospective (90 min)

**Role:** Full team (User 1, 2, 3)

**Objective:** Complete a sprint and plan the next one

**Part 1: Sprint Retrospective (30 min)**

1. **Generate AI Insights** (5 min)
   - User 1: Navigate to AI Insights > Retrospective
   - Click "Generate Retrospective Insights"
   - Wait for AI analysis
   - Review results:
     - What Went Well: 4 points
     - What Could Improve: 3 points
     - Action Items: 5 items
     - Team Sentiment: Positive

2. **Team Discussion** (15 min)
   - Start video call
   - Share screen with AI insights
   - Discuss each point
   - Vote on action items to carry forward
   - Add manual notes to doc

3. **Complete Sprint** (5 min)
   - User 1: Click "Complete Sprint"
   - Final velocity: 38/40 points (95%)
   - 1 task moved back to backlog
   - Sprint marked "completed"

4. **Review Metrics** (5 min)
   - View sprint report
   - Burndown chart review
   - Velocity vs previous sprints
   - Team member contributions

**Part 2: Sprint Planning (60 min)**

5. **Refine Backlog** (15 min)
   - Review top 20 backlog items
   - Update priorities
   - Add new tasks from AI generation
   - Remove obsolete tasks

6. **Estimate Tasks** (25 min)
   - Use Planning Poker for top 15 tasks
   - Session 1-5: Vote, discuss, accept
   - Each takes ~5 minutes
   - All tasks estimated

7. **Create Sprint** (5 min)
   - Sprint name: "Sprint 2 - Core Features"
   - Duration: 2 weeks
   - Capacity: 42 points (team learned from Sprint 1)
   - Goal: "Complete shopping cart and checkout"

8. **Select Sprint Tasks** (10 min)
   - Add estimated tasks to sprint
   - Monitor story point total
   - Stop at 40 points (2 point buffer)
   - Balance workload across team

9. **Start Sprint** (5 min)
   - Review sprint commitment
   - Set scheduled tasks:
     - Daily standup reminder (9 AM weekdays)
     - Sprint report (Friday 5 PM)
   - Click "Start Sprint"
   - First tasks assigned

**Verification:**
- [ ] Retrospective insights valuable
- [ ] Sprint completed with 95% velocity
- [ ] All tasks estimated via planning poker
- [ ] New sprint created and started
- [ ] Scheduled tasks configured
- [ ] Team aligned on goals

---

### Scenario 4: Remote Team Collaboration (60 min)

**Role:** Distributed team across 3 time zones

**Objective:** Collaborate effectively despite distance

**Setup:**
- User 1: San Francisco (PST)
- User 2: New York (EST)
- User 3: London (GMT)

**Morning Session (overlap: 8 AM PST / 11 AM EST / 4 PM GMT):**

1. **Async Communication** (10 min)
   - User 3 (finished for day): Leaves detailed comments on cards
   - Adds @mentions for User 1 and User 2
   - Updates board before logging off
   - User 1 & 2: Get notifications when they start work

2. **Video Standup** (15 min)
   - All users join video call (only 1-hour overlap)
   - Quick status updates
   - Screen share: Review board together
   - Identify dependencies
   - Record meeting (optional)
   - AI: Generate summary for absent members

3. **Collaborative Design Review** (20 min)
   - User 3: Shares screen (design mockups)
   - User 1 & 2: Review and comment
   - Real-time cursor tracking shows who's pointing where
   - User 2: Adds comments directly on cards
   - Decisions logged in meeting summary

4. **Offline Work** (Individual, throughout day)
   - User 1: Works offline during commute
   - Creates 2 new tasks on mobile
   - Edits card details
   - Changes sync when WiFi available
   - User 2: Reviews and updates while online

5. **Async Updates** (15 min)
   - User 1: Records Loom video explaining architecture
   - Attaches to card (if file upload working)
   - User 2: Adds follow-up questions as comments
   - User 3: Responds to comments when they start work (8 AM GMT)

**Availability Management:**
6. **Handle Time Zones** (5 min)
   - User 1: Requests vacation (next week)
   - User 2: Sees availability calendar
   - User 2: Notices overlap issue
   - Team adjusts task assignments
   - Scheduled tasks adjusted for time zones

**Verification:**
- [ ] Real-time collaboration despite distance
- [ ] Async communication effective
- [ ] Video call high quality
- [ ] Offline mode works on mobile
- [ ] Time zone conflicts identified
- [ ] All work synchronized

---

### Scenario 5: Risk Management & Escalation (45 min)

**Role:** Project Manager handling crisis

**Objective:** Identify and mitigate project risks

**Crisis Situation:**
- Sprint 50% complete, 15% of work done
- 2 developers out sick
- Critical feature blocked
- Client deadline in 1 week

**Actions:**

1. **Risk Detection** (5 min)
   - Navigate to Risk Dashboard
   - Observe high risk score (75/100)
   - Review risk indicators:
     - ⚠️ Velocity Drop: 40% decrease
     - 🔴 Resource Overload: 2 people at 150%
     - ⛔ Blocked Tasks: 3 critical items
     - 📅 Deadline Risk: 1 week remaining

2. **AI Risk Analysis** (5 min)
   - Use AI: "Predict Project Risks"
   - AI identifies:
     - Resource constraint (high severity, 85% probability)
     - Schedule risk (critical severity, 90% probability)
     - Quality risk (medium severity, 60% probability)
   - Mitigation suggestions:
     - Reduce scope by 25%
     - Hire contractor for 1 week
     - Extend deadline by 3 days

3. **Create Action Plan** (10 min)
   - Start video call with stakeholders
   - Share screen: Risk dashboard
   - Discuss options
   - Decision: Reduce scope + extend deadline 2 days
   - Document in meeting summary
   - AI generates action items

4. **Implement Mitigations** (15 min)
   - Automation rule: "Critical overdue → Escalate to PM"
     - Trigger: Priority = critical AND due date < today
     - Action: Assign to PM, notify all team
   - Move 5 low-priority tasks to next sprint
   - Reassign tasks from sick developers
   - Use AI Resource Optimization:
     - Suggests reassignments
     - Balances workload
   - Update sprint capacity: 60 → 40 points

5. **Scheduled Monitoring** (5 min)
   - Create scheduled task:
     - "Daily risk report"
     - Time: 8 AM daily
     - Action: Send report with risk metrics
     - Recipients: PM + stakeholders
   - Create scheduled task:
     - "Standup reminder"
     - Time: 9 AM daily
     - Action: Notify team

6. **Track Recovery** (5 min)
   - Next day: Check risk dashboard
   - Risk score: 75 → 45 (medium)
   - Burndown chart: Back on track
   - Team morale: Improved (AI sentiment)
   - Client notification: Automated email sent

**Verification:**
- [ ] Risks identified accurately
- [ ] AI provided actionable insights
- [ ] Action plan documented
- [ ] Automations configured
- [ ] Workload rebalanced
- [ ] Recovery tracked

---

## Integration Testing

### Test 1: End-to-End User Journey
**Time:** 2 hours

**Scenario:** New user signs up and completes first sprint

**Steps:**
1. Register new account
2. Verify email (if implemented)
3. Create first project
4. Invite team member
5. Create 10 cards
6. Organize into sprint
7. Estimate with planning poker
8. Start sprint
9. Work on tasks (move cards)
10. Track time
11. Use video call for standup
12. Complete sprint
13. View retrospective
14. Plan next sprint

**Checkpoints:**
- [ ] No errors at any step
- [ ] All data persists
- [ ] Real-time updates work
- [ ] Notifications received
- [ ] Reports accurate

### Test 2: Multi-Feature Integration
**Test features working together:**

**Automation + Webhooks:**
- [ ] Automation triggers webhook
- [ ] Webhook payload contains automation details
- [ ] Webhook logs show execution

**Time Tracking + Analytics:**
- [ ] Time entries reflected in reports
- [ ] Burndown chart accounts for time spent
- [ ] Resource allocation shows hours worked

**AI + Scheduled Tasks:**
- [ ] Scheduled task runs AI analysis
- [ ] AI report sent via automation
- [ ] Risk predictions update dashboard

**Offline + Real-time:**
- [ ] Offline changes sync when online
- [ ] Real-time updates resume after sync
- [ ] No duplicate actions

**Video + Screen Share + Offline:**
- [ ] Can join video call after being offline
- [ ] Screen share works after reconnection
- [ ] Chat messages sync

---

## Edge Cases & Error Handling

### Network Errors
- [ ] API timeout (30s) shows error message
- [ ] Retry mechanism works (3 attempts)
- [ ] Offline mode activates automatically
- [ ] Connection restored: Auto-sync

### Invalid Data
- [ ] XSS attempt in card title: Sanitized
- [ ] SQL injection in search: Prevented
- [ ] Invalid date range: Validation error
- [ ] Negative story points: Not allowed
- [ ] Invalid cron expression: Clear error

### Concurrent Edits
**Setup:** 2 users edit same card simultaneously

- [ ] Last write wins (with timestamp)
- [ ] Conflict notification (optional)
- [ ] Version history available
- [ ] Real-time sync prevents most conflicts

### Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

**Features to verify:**
- [ ] WebSocket connections
- [ ] WebRTC (may not work in some browsers)
- [ ] ServiceWorker (not in private/incognito)
- [ ] IndexedDB
- [ ] Drag and drop

### Performance Under Load
- [ ] 100+ cards on board: No lag
- [ ] 10 users in video call: Smooth video
- [ ] 1000+ time entries: Reports load < 3s
- [ ] 50+ webhook logs: Table renders quickly
- [ ] Large file upload: Progress indicator

---

## Performance Testing

### Load Time
- [ ] First page load: < 3 seconds
- [ ] Subsequent pages: < 1 second
- [ ] Board with 50 cards: < 2 seconds
- [ ] Analytics dashboard: < 2 seconds

### Real-Time Latency
- [ ] Card move propagation: < 100ms
- [ ] Cursor tracking update: 50ms (20 fps)
- [ ] Chat message delivery: < 200ms
- [ ] Notification delivery: < 500ms

### API Response Time
- [ ] GET /api/boards/:id: < 200ms
- [ ] POST /api/cards: < 300ms
- [ ] AI endpoints: 2-5 seconds (depends on OpenAI)
- [ ] Complex reports: < 3 seconds

### Memory Usage
- [ ] Browser tab: < 200 MB
- [ ] After 1 hour use: < 300 MB
- [ ] IndexedDB: < 50 MB
- [ ] No memory leaks (check DevTools)

---

## Bug Reporting Template

When you find a bug, use this template:

```markdown
## Bug Report

**Title:** Brief description (e.g., "Cannot delete card with comments")

**Severity:** Critical / High / Medium / Low

**Priority:** P0 (Blocker) / P1 (High) / P2 (Medium) / P3 (Low)

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop
- Screen: 1920x1080

**Steps to Reproduce:**
1. Navigate to Board view
2. Click on card with 3+ comments
3. Click "Delete" button
4. Confirm deletion

**Expected Result:**
Card deleted, removed from board

**Actual Result:**
Error message: "Cannot delete card with comments"
Card remains on board

**Screenshots:**
[Attach screenshot]

**Console Errors:**
```
Error: Cannot delete card with active comments
  at deleteCard (cardController.ts:45)
```

**Additional Context:**
- Happens only with cards that have comments
- Works fine for cards without comments
- Started happening after last deployment

**Workaround:**
Delete all comments first, then delete card

**Related Issues:**
#123, #456
```

---

## Test Completion Checklist

### Core Features (1-6)
- [ ] Authentication & Authorization
- [ ] Real-Time Kanban Boards
- [ ] Sprint Planning
- [ ] Resource Allocation
- [ ] Gantt Charts
- [ ] Team Collaboration & Notifications

### Advanced Features (7-14)
- [ ] Real-Time Analytics
- [ ] Time Tracking
- [ ] Custom Fields & Forms
- [ ] Story Point Poker
- [ ] Risk & Bottleneck Detection
- [ ] Team Availability Calendar
- [ ] Workflow Automation
- [ ] Webhook Integrations
- [ ] Scheduled Tasks

### AI & Modern Features (15-17)
- [ ] AI-Powered Insights
- [ ] Offline Mode & PWA
- [ ] Video & Screen Sharing

### Integration & Performance
- [ ] End-to-End Scenarios
- [ ] Multi-Feature Integration
- [ ] Edge Cases
- [ ] Performance Benchmarks

### Documentation
- [ ] All bugs reported
- [ ] Test results documented
- [ ] Screenshots captured
- [ ] Feedback provided

---

## Summary & Sign-Off

**Tester Name:** _______________
**Date:** _______________
**Total Test Duration:** _____ hours

**Overall Assessment:**
- [ ] Ready for Production
- [ ] Ready with Minor Issues
- [ ] Needs Major Fixes
- [ ] Not Ready

**Critical Issues Found:** _____
**High Priority Issues:** _____
**Medium Priority Issues:** _____
**Low Priority Issues:** _____

**Top 3 Issues:**
1. _______________
2. _______________
3. _______________

**Recommendations:**
_______________________________________________
_______________________________________________
_______________________________________________

**Signature:** _______________
