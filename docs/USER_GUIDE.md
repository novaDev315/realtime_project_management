# User Guide
## Real-Time Project Management Platform

**Welcome!** This guide will help you get started with the platform and learn all the features.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Quick Start Guide](#quick-start-guide)
3. [Feature Guides](#feature-guides)
4. [Best Practices](#best-practices)
5. [Tips & Tricks](#tips--tricks)
6. [FAQ](#faq)

---

## Getting Started

### Sign Up & Login

1. **Create Account**
   - Navigate to `/register`
   - Enter your email, name, and password
   - Password must be at least 8 characters
   - Click "Sign Up"

2. **Login**
   - Go to `/login`
   - Enter your credentials
   - Click "Sign In"
   - You'll be redirected to the dashboard

### First-Time Setup

After logging in for the first time:

1. **Update Profile** (Optional)
   - Click your avatar in top-right
   - Select "Profile"
   - Add profile picture, bio, skills
   - Set notification preferences

2. **Create Your First Project**
   - Click "New Project" button
   - Enter project name (e.g., "Website Redesign")
   - Add description and goals
   - Click "Create"

---

## Quick Start Guide

### 5-Minute Setup

**Goal:** Create a project and start managing tasks

**Step 1: Create Project** (1 min)
```
1. Click "+ New Project"
2. Name: "My First Project"
3. Click "Create"
```

**Step 2: Create Cards** (2 min)
```
1. Go to "Kanban Board" tab
2. Click "+ Add Card" in "To Do" column
3. Fill in:
   - Title: "Setup project repository"
   - Priority: High
   - Story Points: 3
4. Create 3-5 more cards
```

**Step 3: Organize Sprint** (2 min)
```
1. Go to "Sprints" tab
2. Click "+ Create Sprint"
3. Name: "Sprint 1"
4. Duration: 2 weeks
5. Add your cards to the sprint
6. Click "Start Sprint"
```

**Done!** You're now managing your first sprint.

---

## Feature Guides

### 1. Kanban Boards

#### What is it?
Visual board with columns (To Do, In Progress, Done) for tracking work.

#### How to Use:

**Creating Cards:**
1. Click "+ Add Card" in any column
2. Fill in details:
   - **Title**: Brief description (required)
   - **Description**: Details, requirements
   - **Priority**: Low, Medium, High, Critical
   - **Story Points**: Complexity estimate (1-13)
   - **Assignee**: Who's working on it
   - **Due Date**: Deadline
   - **Labels**: Tags for categorization

**Moving Cards:**
- **Drag & Drop**: Click and drag card to new column
- **Real-time**: Other users see updates instantly
- **Live Cursors**: See where teammates are pointing

**Card Details:**
- Click card to open full view
- Add comments and @mentions
- Upload attachments (files)
- View history of changes
- Set blockers

**Keyboard Shortcuts:**
- `N`: New card
- `→`: Move card right
- `←`: Move card left
- `E`: Edit card
- `Del`: Delete card

---

### 2. Sprint Planning

#### What is it?
Time-boxed iterations (usually 2 weeks) to complete specific work.

#### How to Use:

**Create Sprint:**
1. Go to "Sprints" tab
2. Click "+ Create Sprint"
3. Fill in:
   - **Name**: Sprint 1 - Foundation
   - **Start Date**: Today
   - **End Date**: +2 weeks
   - **Goal**: What you want to achieve
   - **Capacity**: Total story points (e.g., 40)

**Add Cards to Sprint:**
1. Open sprint
2. Click "Add Cards"
3. Select from backlog
4. Watch total points counter
5. Stop when reaching capacity

**Start Sprint:**
- Click "Start Sprint" button
- Sprint status: Planning → Active
- Burndown chart starts tracking

**During Sprint:**
- Move cards through columns
- Track velocity (points completed)
- View burndown chart daily
- Mark cards as done

**Complete Sprint:**
- Click "Complete Sprint"
- Review velocity
- Move incomplete cards to backlog
- View retrospective

---

### 3. Planning Poker (Story Point Estimation)

#### What is it?
Team voting to estimate task complexity using Fibonacci numbers.

#### How to Use:

**Start Session** (Facilitator):
1. Go to "Planning Poker" tab
2. Select card to estimate
3. Click "Start Session"
4. Share link with team

**Join Session** (Team):
1. Open session link
2. Review card details
3. Select story point card (1, 2, 3, 5, 8, 13, etc.)
4. Wait for others to vote

**Reveal & Discuss:**
1. Facilitator clicks "Reveal"
2. All votes shown simultaneously
3. Discuss differences
4. Re-vote if needed
5. Accept final estimate

**Special Cards:**
- **?** (Unknown): Need more info
- **☕** (Coffee): Need a break

**Tips:**
- Discuss why estimates differ
- Higher votes usually mean uncertainty
- Aim for consensus (votes within 1-2 numbers)

---

### 4. Time Tracking

#### What is it?
Track how much time you spend on tasks.

#### How to Use:

**Start Timer:**
1. Go to "Time Tracking" tab
2. Click "Start Timer"
3. Fill in:
   - Description: What you're working on
   - Card: Select related task
   - Billable: Yes/No
   - Tags: Optional categories
4. Timer starts counting

**Stop Timer:**
1. Click "Stop Timer"
2. Duration auto-calculated
3. Entry saved to list

**Manual Entry:**
1. Click "+ Add Entry"
2. Enter:
   - Date
   - Start time
   - End time (duration auto-calculated)
   - Description and card
3. Save

**Approval Workflow:**
- Submit entries for approval
- Manager reviews and approves
- Approved entries lock (no editing)

**Reports:**
1. Go to "Time Report" tab
2. Select:
   - Date range
   - Group by: User, Card, Project
   - Filter: Billable, Tags
3. Click "Generate Report"
4. Export to CSV

---

### 5. Custom Fields

#### What is it?
Add your own fields to cards, projects, or sprints.

#### How to Use:

**Create Field:**
1. Go to "Custom Fields" tab
2. Click "+ Add Field"
3. Configure:
   - **Name**: Client Name
   - **Type**: Text, Number, Date, Select, etc.
   - **Required**: Yes/No
   - **Applies To**: Cards, Projects, or Sprints
   - **Validation**: Min/max, pattern
4. Save

**Field Types:**
- **Text**: Short text input
- **Number**: Numeric values
- **Date**: Date picker
- **Select**: Dropdown (single choice)
- **Multi-select**: Multiple choices
- **Checkbox**: Yes/No
- **URL**: Website link
- **Email**: Email address
- **Phone**: Phone number
- **File**: File upload
- **Calculated**: Auto-calculated from formula

**Conditional Logic:**
- Show/hide fields based on other values
- Example: Show "Designer" field only if "Requires Design" = Yes

**Using Fields:**
- Custom fields appear in forms
- Required fields must be filled
- Values saved with entity

---

### 6. Resource Allocation

#### What is it?
Manage team workload and capacity.

#### How to Use:

**View Team Capacity:**
1. Go to "Resources" tab
2. See bar chart for each team member
3. Colors indicate utilization:
   - **Green**: <70% (available)
   - **Yellow**: 70-90% (busy)
   - **Red**: >90% (overloaded)

**Skills Matrix:**
- View team skills heatmap
- Filter tasks by required skills
- Assign based on expertise

**Availability Calendar:**
1. Go to "Availability" tab
2. Request time off:
   - Click date on calendar
   - Select type (Vacation, Sick, etc.)
   - Enter dates and reason
   - Submit for approval
3. Manager approves/rejects
4. Team capacity adjusts automatically

---

### 7. Analytics & Reports

#### What is it?
Visual insights into project health and team performance.

#### How to Use:

**Dashboard Widgets:**
1. Go to "Analytics" tab
2. View key metrics:
   - **Active Tasks**: Currently in progress
   - **Team Velocity**: Average points/sprint
   - **Completion Rate**: % done on time
   - **Team Size**: Active members

**Charts:**
- **Burndown**: Sprint progress vs ideal
- **Velocity Trend**: Points completed per sprint
- **Task Distribution**: Breakdown by status
- **Team Performance**: Points by team member

**Risk Dashboard:**
1. Go to "Risk & Bottlenecks" tab
2. View overall risk score (0-100)
3. See risk indicators:
   - Overdue tasks
   - Blocked tasks
   - Velocity drops
   - Resource overload
   - Aging tasks
4. Review bottleneck analysis
5. Follow recommendations

---

### 8. Automation Rules

#### What is it?
Automatically perform actions when certain events happen.

#### How to Use:

**Create Rule:**
1. Go to "Automation" tab
2. Click "+ Create Rule"
3. Configure:
   - **Name**: Auto-assign bugs
   - **Trigger**: Card created
   - **Conditions**: Label = "bug"
   - **Actions**:
     - Assign to: Lead Developer
     - Add label: "needs-triage"
     - Send notification
4. Enable rule

**Trigger Types:**
- Card created, moved, updated
- Status changed
- Assignee changed
- Due date approaching
- Sprint started/completed

**Action Types:**
- Assign user
- Change status
- Add label
- Send notification
- Move to column
- Add comment
- Change priority

**Example Rules:**
- "When critical task overdue → Assign to PM"
- "When card moved to Testing → Notify QA team"
- "When sprint starts → Send welcome email"

---

### 9. Webhooks

#### What is it?
Send HTTP requests to external services when events happen.

#### How to Use:

**Create Webhook:**
1. Go to "Webhooks" tab
2. Click "+ Create Webhook"
3. Configure:
   - **Name**: Slack Notifications
   - **URL**: Your webhook endpoint (HTTPS)
   - **Events**: Select events to listen for
   - **Secret**: For signature verification
   - **Headers**: Custom headers (optional)

**Test Webhook:**
1. Click "Test" button
2. Review payload
3. Check response

**Monitor Execution:**
- View execution logs
- See success/failure status
- Check response times
- Retry failed requests

**Webhook Payload:**
```json
{
  "event": "card.created",
  "timestamp": "2025-11-19T10:30:00Z",
  "data": {
    "card": { /* card details */ },
    "user": { /* user who triggered */ }
  }
}
```

---

### 10. Scheduled Tasks

#### What is it?
Run tasks automatically at specified times using cron schedules.

#### How to Use:

**Create Scheduled Task:**
1. Go to "Scheduled Tasks" tab
2. Click "+ Create Task"
3. Configure:
   - **Name**: Daily standup reminder
   - **Schedule**: Select preset or custom cron
   - **Action**: What to do
   - **Timezone**: Your timezone
4. Enable task

**Cron Presets:**
- **Every weekday at 9 AM**: `0 9 * * 1-5`
- **Daily at midnight**: `0 0 * * *`
- **Weekly on Sunday**: `0 0 * * 0`
- **Every 15 minutes**: `*/15 * * * *`

**Action Types:**
- Create card automatically
- Send scheduled report
- Update sprint data
- Send notifications
- Run automation rule

**Monitor Execution:**
- View next run time
- Check run count
- See failure count
- Review execution logs

---

### 11. AI-Powered Insights

#### What is it?
Use AI (GPT-4) to get intelligent insights and automate tasks.

**⚠️ Requires:** OpenAI API key configured

#### Features:

**Sprint Prediction:**
1. Go to "AI Insights" > "Sprint Prediction"
2. Click "Predict Completion"
3. View:
   - Will complete on time? (Yes/At-Risk/No)
   - Confidence score (0-100%)
   - Estimated completion date
   - Recommended actions

**Retrospective Insights:**
1. After sprint completes
2. Go to "Retrospective" tab
3. Click "Generate Insights"
4. Review AI-generated:
   - What Went Well (3-5 items)
   - What Could Improve (3-5 items)
   - Action Items (3-5 items)
   - Team Sentiment (Positive/Neutral/Negative)

**Task Generation:**
1. Go to "Generate Tasks" tab
2. Describe what you want in plain English:
   ```
   I need to build a user authentication system with
   email verification, password reset, and 2FA
   ```
3. Click "Generate Tasks"
4. Review AI-generated tasks with:
   - Title and description
   - Priority and story points
   - Dependencies
5. Click "Create" to add to backlog

**Risk Analysis:**
1. Go to "Risk Analysis" tab
2. Click "Predict Risks"
3. View:
   - Overall risk score
   - Individual risks (severity, probability, impact)
   - Mitigation strategies

**AI Chat Assistant:**
1. Go to "AI Assistant" tab
2. Ask questions:
   - "What's our current sprint velocity?"
   - "Which tasks are at risk?"
   - "How can we improve our workflow?"
3. Get context-aware answers

---

### 12. Offline Mode (PWA)

#### What is it?
Work without internet connection, changes sync when you're back online.

#### How to Use:

**Enable Offline Mode:**
- Automatically enabled after first visit
- ServiceWorker caches pages and data
- IndexedDB stores project data locally

**Install as App:**
**Desktop:**
1. Look for install icon in address bar (⊕)
2. Click "Install"
3. App opens in standalone window

**Mobile:**
1. Menu → "Add to Home Screen"
2. App icon added to home screen
3. Opens fullscreen

**Work Offline:**
1. Disconnect from internet
2. Continue working:
   - View cached boards
   - Create/edit cards
   - Move tasks
   - Add comments
3. Changes stored locally

**Sync When Online:**
1. Reconnect to internet
2. Changes automatically sync
3. No data loss
4. Real-time updates resume

**Offline Capabilities:**
- ✅ View boards and cards
- ✅ Create new cards
- ✅ Edit card details
- ✅ Move cards between columns
- ✅ Add comments
- ✅ View sprint data
- ❌ Real-time updates (need internet)
- ❌ Video calls (need internet)
- ❌ AI features (need internet)

---

### 13. Video & Screen Sharing

#### What is it?
Face-to-face meetings with screen sharing capabilities.

#### How to Use:

**Start Video Call:**
1. Go to "Video Call" tab
2. Grant camera/microphone permissions
3. Wait for team to join
4. Your video appears bottom-right (PiP)

**Join Call:**
1. Click video call link
2. Grant permissions
3. See all participants in grid

**Controls:**
- **🎤 Microphone**: Click to mute/unmute
- **📹 Camera**: Click to turn on/off
- **🖥️ Screen Share**: Click to share screen
- **📞 Leave**: Click to exit call

**Screen Sharing:**
1. Click screen share button
2. Choose what to share:
   - Entire screen
   - Application window
   - Browser tab
3. Click "Share"
4. All participants see your screen
5. Click again to stop sharing

**Tips:**
- Use headphones to prevent echo
- Good lighting for better video
- Close unnecessary apps before screen share
- Mute when not speaking
- Test camera/mic before important calls

**Limitations:**
- Works best with <10 participants
- Requires good internet (2+ Mbps)
- Some browsers have better support (Chrome recommended)

---

## Best Practices

### Project Management

**1. Sprint Planning:**
- Keep sprints 1-2 weeks long
- Don't overcommit (80% of capacity)
- Have clear sprint goals
- Estimate tasks before sprint starts

**2. Daily Standups:**
- Keep to 15 minutes
- Use video call for remote teams
- Update board in real-time
- Note blockers immediately

**3. Card Organization:**
- Use clear, actionable titles
- Add detailed descriptions
- Set realistic due dates
- Assign to one person
- Use labels for categories

**4. WIP Limits:**
- Limit "In Progress" column (3-5 cards)
- Finish before starting new work
- Reduces context switching
- Improves flow

### Team Collaboration

**1. Communication:**
- Use @mentions in comments
- Add context to messages
- Respond within 24 hours
- Use video for complex discussions

**2. Code Reviews:**
- Add PR link in card comments
- @mention reviewers
- Set automation to notify QA
- Mark card "Done" only after merge

**3. Documentation:**
- Keep card descriptions updated
- Document decisions in comments
- Use wiki/docs for architecture
- Link related cards

### Automation

**1. Start Simple:**
- Create 1-2 rules first
- Test thoroughly
- Add more gradually
- Monitor execution logs

**2. Common Patterns:**
- Auto-assign by label
- Notify on status change
- Escalate overdue tasks
- Welcome new sprint members

**3. Avoid Over-Automation:**
- Don't automate everything
- Keep rules understandable
- Review periodically
- Disable unused rules

---

## Tips & Tricks

### Keyboard Shortcuts

**Board View:**
- `N`: New card
- `F`: Focus search
- `/`: Command palette
- `?`: Help

**Card View:**
- `E`: Edit
- `C`: Add comment
- `M`: Mention user
- `Esc`: Close

**Navigation:**
- `G` + `B`: Go to Board
- `G` + `S`: Go to Sprints
- `G` + `A`: Go to Analytics

### Power User Features

**Bulk Operations:**
- Select multiple cards: `Shift + Click`
- Bulk assign: Drag to assignee
- Bulk label: Drag to label
- Bulk delete: Multi-select + Del

**Quick Filters:**
- Click member avatar: Filter by assignee
- Click label: Filter by label
- Click priority: Filter by priority
- Combine filters with `+`

**Smart Search:**
- `assignee:me`: Your tasks
- `label:bug`: All bugs
- `priority:high`: High priority
- `status:done`: Completed tasks
- `due:overdue`: Overdue tasks

**Templates:**
- Save card as template
- Reuse for similar tasks
- Include checklists
- Clone cards with `Ctrl + D`

### Mobile Tips

**Responsive Design:**
- Full feature parity on mobile
- Swipe cards to move
- Pull to refresh
- Bottom navigation

**Offline Mobile:**
- Install PWA on phone
- Works offline
- Syncs when connected
- Push notifications

### Performance Tips

**Speed up board loading:**
- Archive old cards
- Complete old sprints
- Limit cards per board (<100)
- Use filters for large boards

**Reduce lag:**
- Close unused tabs
- Clear browser cache weekly
- Use Chrome for best performance
- Disable browser extensions if slow

---

## FAQ

### General

**Q: Is my data secure?**
A: Yes. All data encrypted in transit (HTTPS) and at rest. Passwords hashed with bcrypt. JWT tokens for authentication.

**Q: Can I use this offline?**
A: Yes! Install as PWA and work offline. Changes sync when you reconnect.

**Q: How many users can I have?**
A: No hard limit. Performance tested up to 50 active users per project.

**Q: Is there a mobile app?**
A: Install as PWA on iOS/Android. Native apps coming soon.

**Q: Can I export my data?**
A: Yes. Export time reports to CSV. Full data export coming soon.

### Features

**Q: How do I delete a project?**
A: Project Settings → Danger Zone → Delete Project (requires confirmation)

**Q: Can I recover deleted cards?**
A: Not currently. Soft delete coming soon. Be careful!

**Q: How accurate are AI predictions?**
A: Typically 70-85% accurate. Based on historical data and patterns.

**Q: Does video calling work on all browsers?**
A: Best on Chrome. Firefox and Safari supported. Edge partially supported.

**Q: How many people can join a video call?**
A: Recommended: <10. Maximum tested: 20. Performance varies by device.

**Q: What if AI API key runs out of credits?**
A: AI features will show error. Add credits to your OpenAI account.

### Troubleshooting

**Q: Real-time updates not working?**
A:
1. Check WebSocket connection (DevTools > Network > WS)
2. Firewall/proxy blocking port?
3. Refresh page
4. Clear cache and cookies

**Q: Cards not syncing offline?**
A:
1. Check IndexedDB enabled
2. Check storage quota
3. Clear old data
4. Try refreshing

**Q: Video call not connecting?**
A:
1. Grant camera/mic permissions
2. Check firewall (WebRTC uses UDP)
3. Try different browser
4. Use TURN server if behind strict firewall

**Q: Slow performance?**
A:
1. Archive completed sprints
2. Clear browser cache
3. Close other tabs
4. Check internet speed
5. Reduce WIP limits

### Billing & Limits

**Q: Is this free?**
A: Platform is free. You need your own OpenAI API key for AI features.

**Q: API usage costs?**
A: OpenAI charges per API call. Typically $0.01-0.03 per AI request.

**Q: Storage limits?**
A: No hard limit. Large files may require S3 configuration.

---

## Getting Help

### Documentation
- **User Guide**: This document
- **Manual Test Guide**: `MANUAL_TEST_GUIDE.md`
- **PRD**: `PRD.md`
- **API Docs**: Coming soon

### Support Channels
- **GitHub Issues**: Report bugs
- **Email**: support@example.com (configure)
- **Slack Community**: Join #realtime-pm
- **Stack Overflow**: Tag `realtime-pm`

### Contributing
- **Feature Requests**: GitHub Issues
- **Bug Reports**: GitHub Issues with template
- **Pull Requests**: Welcome!
- **Documentation**: Help improve docs

---

## Glossary

**Terms you should know:**

- **Backlog**: List of tasks not yet in a sprint
- **Burndown**: Chart showing remaining work vs time
- **Epic**: Large feature spanning multiple sprints
- **Fibonacci**: Number sequence for story points (1,2,3,5,8,13...)
- **Kanban**: Visual board with columns for workflow
- **Sprint**: Time-boxed iteration (usually 2 weeks)
- **Story Points**: Measure of task complexity (not hours)
- **Velocity**: Average points completed per sprint
- **WIP**: Work In Progress (tasks currently active)
- **WebRTC**: Technology for video/audio calls
- **PWA**: Progressive Web App (installable, works offline)
- **Cron**: Schedule format (e.g., `0 9 * * *` = 9 AM daily)

---

## Quick Reference Card

**Common Tasks:**

| Task | Steps |
|------|-------|
| Create card | Board → + Add Card → Fill form → Save |
| Start sprint | Sprints → Create → Add cards → Start Sprint |
| Estimate task | Planning Poker → Select card → Vote → Accept |
| Track time | Time Tracking → Start Timer → Work → Stop Timer |
| Create automation | Automation → Create Rule → Configure → Enable |
| Schedule task | Scheduled Tasks → Create → Set cron → Save |
| Join video call | Video Call tab → Grant permissions → Join |
| Work offline | Disconnect → Use normally → Reconnect (auto-sync) |
| Get AI insights | AI Insights → Choose feature → Get prediction |

**Emergency Actions:**

| Problem | Solution |
|---------|----------|
| Lost connection | Check offline mode activated, work continues |
| Critical bug | Create card, priority: Critical, label: blocker |
| Sprint failing | Risk Dashboard → Review → Adjust scope |
| Overloaded team | Resources → View capacity → Reassign tasks |
| Need help now | Start video call → Share screen → Discuss |

---

**Congratulations!** You're now ready to use all features of the Real-Time Project Management Platform.

For detailed testing procedures, see `MANUAL_TEST_GUIDE.md`.

**Happy project managing! 🚀**
