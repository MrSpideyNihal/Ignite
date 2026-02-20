# IGNITE V2 — Ultra-Detailed Event Management Guide

> **This guide tells you exactly what to click, where to find it, and what happens next.**
> Written for people who have never used the system before.

---

## 📋 Table of Contents

1. [Understanding the Navigation Bar](#1-understanding-the-navigation-bar)
2. [Phase 1: First-Time Setup (Super Admin)](#2-phase-1-first-time-setup-super-admin)
3. [Phase 2: Creating & Configuring an Event](#3-phase-2-creating--configuring-an-event)
4. [Phase 3: Assigning Committee Members](#4-phase-3-assigning-committee-members)
5. [Phase 4: Team Registration](#5-phase-4-team-registration)
6. [Phase 5: Approving Teams](#6-phase-5-approving-teams)
7. [Phase 6: Team Portal (For Participants)](#7-phase-6-team-portal-for-participants)
8. [Phase 7: Setting Up Jury & Evaluation](#8-phase-7-setting-up-jury--evaluation)
9. [Phase 8: Event Day — QR Scanning & Logistics](#9-phase-8-event-day--qr-scanning--logistics)
10. [Phase 9: Event Day — Food Management](#10-phase-9-event-day--food-management)
11. [Phase 10: Jury Evaluation (For Jury Members)](#11-phase-10-jury-evaluation-for-jury-members)
12. [Phase 11: Announcements](#12-phase-11-announcements)
13. [Phase 12: Accommodation & Commute](#13-phase-12-accommodation--commute)
14. [Phase 13: Exporting Data](#14-phase-13-exporting-data)
15. [Phase 14: Post-Event & Archiving](#15-phase-14-post-event--archiving)
16. [Troubleshooting & Common Scenarios](#16-troubleshooting--common-scenarios)
17. [Complete Route Reference](#17-complete-route-reference)

---

## 1. Understanding the Navigation Bar

The navigation bar is at the **very top of every page**. It looks different depending on whether you're logged in or not.

### If You Are NOT Logged In (Public User)

You see these items from **left to right**:

| Position | What You See | What It Does |
|----------|-------------|-------------|
| Far left | 🔥 **IGNITE 2026** (logo + text) | Click to go to the home page |
| Center | **Home** | Goes to the landing page `/` |
| Center | **Register Team** | Goes to the events list page `/events` where you pick an event to register for |
| Center | **Team Portal** | Goes to `/team` where you enter your phone number or team code to access your team dashboard |
| Far right | **Volunteer** button (small, gray) | Goes to `/volunteer` page for volunteer announcements & bus schedules |
| Far right | **Staff Login** button (blue, filled) | Click this to sign in with your Google account. Only for admins and committee members |

### If You ARE Logged In (Staff/Admin)

Everything above stays the same, plus:

| Position | What You See | What It Does |
|----------|-------------|-------------|
| After "Team Portal" | **Dashboard** (separated by a vertical line) | Goes to `/my-dashboard` — automatically sends you to the right page based on your role |
| Far right | Your **name** + **profile photo** | Shows who is logged in |
| Far right | **Logout** button (gray) | Signs you out |

### On Mobile (Phone/Tablet)

- You see the 🔥 logo on the left and a **☰ hamburger menu** (3 horizontal lines) on the right
- **Tap the ☰ icon** to open the menu dropdown
- All the same links appear vertically
- Tap any link, and the menu closes automatically

---

## 2. Phase 1: First-Time Setup (Super Admin)

### Who does this: The main organizer (Super Admin)

### Step 1: Deploy the App

1. Push the code to GitHub
2. Connect the GitHub repo to **Netlify**
3. In Netlify → **Site Settings** → **Environment Variables**, add these:
   - `MONGODB_URI` — Your MongoDB connection string
   - `GOOGLE_CLIENT_ID` — From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
   - `NEXTAUTH_SECRET` — Any random string (e.g., run `openssl rand -base64 32`)
   - `NEXTAUTH_URL` — Your deployed site URL (e.g., `https://ignite.netlify.app`)
   - `SUPER_ADMIN_EMAIL` — Your Google email (e.g., `nihal@gmail.com`)
4. Click **Deploy** in Netlify

### Step 2: First Login

1. Open your deployed site in a browser
2. Look at the **top-right corner** of the navbar
3. Click the **blue "Staff Login" button**
4. A Google sign-in popup appears → Select your Google account (must match `SUPER_ADMIN_EMAIL`)
5. After sign-in, you're redirected back to the home page
6. You should now see your **name and profile photo** in the top-right corner
7. You should also see the **"Dashboard"** link in the navbar (after "Team Portal")

### Step 3: Go to Admin Dashboard

1. In the navbar, click **"Dashboard"**
2. Since you're the super admin, you're automatically redirected to `/admin`
3. You now see the **Super Admin Dashboard** page with the heading "Super Admin Dashboard" and subtitle "Manage all IGNITE events"

**What you see on this page:**
- At the top: Two buttons side by side:
  - **"+ Create New Event"** (blue, filled button) — Creates a new event
  - **"Manage Global Users"** (outlined button) — Goes to user management
- Below: Three sections:
  - **Active Events** — Events that are live
  - **Draft Events** — Events being prepared
  - **Archived Events** — Past events (only shows if any exist)

---

## 3. Phase 2: Creating & Configuring an Event

### Who does this: Super Admin

### Step 1: Click "Create New Event"

1. Go to `/admin` (click **"Dashboard"** in navbar)
2. Click the **blue "+ Create New Event" button** at the top-left of the page
3. You're taken to the **Create New Event** form page

### Step 2: Fill in Event Details

You see a form with these fields. Fill each one:

| Field | What to Enter | Example |
|-------|--------------|---------|
| **Event Name** | Full name of your event | `IGNITE 2026` |
| **Year** | The year number | `2026` |
| **Date** | Click the date picker and select the event date | `2026-03-15` |
| **Venue** | Where the event takes place | `IIT Delhi Campus, New Delhi` |
| **Description** | Short description of the event | `Annual innovation hackathon by Darsana` |
| **Max Team Size** | Maximum number of members per team | `5` |

### Step 3: Submit the Form

1. After filling all fields, click the **"Create Event"** button at the bottom of the form
2. A green success notification appears: *"Event created successfully"*
3. You're redirected back to `/admin`
4. Your new event appears under **"Draft Events"** section as a card

### Step 4: Activate the Event

The event starts in "draft" mode (not visible to the public). To make it active:

1. On `/admin`, find your event card under "Draft Events"
2. Click the **"Manage Event →"** button at the bottom of the event card
3. You're taken to the **Event Management** page (`/admin/events/[eventId]`)
4. On the **left side**, you see a card titled **"Event Settings"**
5. Inside it, under **"Event Status"**, you see three buttons side by side:
   - **Draft** (currently highlighted/selected in blue)
   - **Active**
   - **Archived**
6. Click the **"Active"** button
7. The button turns blue, and a green notification appears: *"Event status updated"*
8. Your event is now **visible on the public events page** (`/events`)

### Step 5: Open Registration

Still on the same Event Management page:

1. Below the status buttons, you see two **toggle switches** (they look like sliding pills):
   - **Registration Open** — Toggle this **ON** (slide to the right, it turns blue)
   - **Evaluation Open** — Leave this **OFF** for now (keep it gray)
2. When you toggle Registration Open to ON, a green notification appears: *"Settings updated"*
3. Teams can now register for your event

---

## 4. Phase 3: Assigning Committee Members

### Who does this: Super Admin

### Where: Event Management Page

1. Go to `/admin` → Click **"Manage Event →"** on your event card
2. You see two cards side by side:
   - **Left card: "Event Settings"** (status + toggles)
   - **Right card: "Committee Members"** with subtitle "Manage roles for this event"

### How to Add a Committee Member

1. Look at the **right card** titled **"Committee Members"**
2. You see three elements in a row:
   - A **text input** with placeholder "email@gmail.com" — Type the person's Google email here
   - A **dropdown** showing available roles — Click to select the role
   - A small **"Add"** button (blue) — Click to assign the role
3. Type the person's **exact Google email** in the text input (e.g., `bablu@gmail.com`)
4. Click the **dropdown** next to it. You see these role options:

| Role | What This Person Can Do |
|------|------------------------|
| **Jury Admin** | Create evaluation questions, assign teams to jury members, lock/unlock evaluations |
| **Jury Member** | Evaluate teams assigned to them, submit scores |
| **Registration Committee** | View all team registrations, approve/reject teams |
| **Food Committee** | View food dashboard, manage food coupons and stats |
| **Logistics Committee** | Use QR scanner, mark attendance, scan food coupons |

5. Select the desired role (e.g., "Registration Committee")
6. Click the **"Add"** button
7. A green notification appears: *"Role assigned"*
8. The person's name, email, and role badge now appear in the list below

### How to Remove a Committee Member

1. In the committee list, find the person you want to remove
2. Each person shows: **Name**, **email** (gray text), a **blue role badge**, and a **red ✕ button**
3. Click the **red ✕ button** next to their role badge
4. A confirmation popup appears: "Remove this role?"
5. Click **OK** to confirm
6. The person is removed from the list

### What Happens After Assignment

- The assigned person logs in with Google (using the same email you entered)
- They see the **"Dashboard"** link in their navbar
- Clicking "Dashboard" takes them directly to their event dashboard
- If they have **one role**, they go straight to their specific page (e.g., logistics page)
- If they have **multiple roles**, they see a selection page to choose which dashboard

### Quick Links at Bottom

Below the two cards, you see **4 quick-access cards** in a row:

| Icon | Label | Where It Goes |
|------|-------|--------------|
| 👥 | **Teams** | `/{eventId}/teams` — View all team registrations |
| ⚖️ | **Jury** | `/{eventId}/jury` — Jury management dashboard |
| 🍽️ | **Food** | `/{eventId}/food` — Food preferences & stats |
| 📱 | **QR Scanner** | `/{eventId}/logistics` — QR scanning & attendance |

Click any card to jump to that section.

---

## 5. Phase 4: Team Registration

### Option A: Teams Register Themselves Online

#### Who does this: Team leads (participants)

#### Step 1: Find the Event

1. Open the website in a browser
2. In the navbar, click **"Register Team"** (or go to `/events`)
3. You see a list of all active events as cards
4. Each card shows: Event name, date, venue
5. Find your event and click the **"Register →"** button on its card

#### Step 2: Sign in with Google (Required)

1. You're taken to the registration page
2. If you're **NOT signed in**, you see a message:
   > "You need to sign in with Google before registering your team"
3. Below the message is a **large blue button** that says **"Sign in with Google"**
4. Click it → Google sign-in popup appears → Select your Google account
5. After signing in, you're redirected back to the same registration page
6. Now you see the registration form

#### Step 3: Fill the Registration Form

The form has several sections. Fill each one carefully:

**Section 1: Project Details**

| Field | What to Enter | Required? |
|-------|--------------|-----------|
| **Project Name** | Full name of your project | ✅ Yes |
| **Project Code** | Short code (given by organizers) | ✅ Yes |

**Section 2: Team Lead Details**

| Field | What to Enter | Required? |
|-------|--------------|-----------|
| **Team Lead Name** | Full name of the team leader | ✅ Yes |
| **Team Lead Email** | Email of team leader | ❌ Optional |
| **Team Lead Phone** | 10-digit phone number (used to access Team Portal later) | ✅ Yes |

**Section 3: Guide Details** (Optional)

| Field | What to Enter | Required? |
|-------|--------------|-----------|
| **Guide Name** | Name of the teacher/mentor | ❌ Optional |
| **Guide Email** | Email of the guide | ❌ Optional |
| **Guide Phone** | Phone number of the guide | ❌ Optional |

**Section 4: Team Members**

For each team member, you see a card with these fields:

| Field | What to Enter | Required? |
|-------|--------------|-----------|
| **Prefix** | Dropdown — Mr / Ms / Dr / N/A | ✅ Yes |
| **Name** | Full name | ✅ Yes |
| **College** | College/university name | ✅ Yes |
| **Branch** | Department (CSE, ECE, etc.) | ✅ Yes |
| **Year of Passing** | Graduation year | ✅ Yes |
| **Phone** | 10-digit phone number | ❌ Optional |
| **Email** | Email address | ❌ Optional |
| **Food Preference** | Dropdown — Vegetarian / Non-Vegetarian | ✅ Yes |

- To add more members: Click the **"+ Add Member"** button below the member cards
- To remove a member: Click the **red "Remove" button** on that member's card
- Maximum members allowed is shown (set by event's max team size)

#### Step 4: Submit Registration

1. After filling everything, click the **large blue "Register Team" button** at the bottom
2. **If successful:**
   - A **green success box** appears with your **Team Code** (e.g., `IGN26-A1B2`)
   - **SAVE THIS CODE** — you need it to access your Team Portal
   - You also see a link to view your team dashboard
3. **If there's an error:**
   - A **red error box** appears explaining what's wrong
   - Common errors: "Project name required", "Team lead phone required", "All member fields required"
   - Fix the issue and click "Register Team" again

---

### Option B: Bulk Import Teams via Excel (Super Admin / Registration Committee)

#### Step 1: Go to Import Page

1. Log in as Super Admin or Registration Committee member
2. Go to the Event Dashboard: Click **"Dashboard"** in navbar
3. Under **"Quick Access"** section, find the card with **📥 icon** labeled **"Import Teams"**
4. Click it → You're taken to `/{eventId}/import`

**Alternative:** Type `/{eventId}/import` directly in the browser address bar

#### Step 2: Prepare Your Excel File

Your Excel file (`.xlsx` or `.csv`) must have these columns:

| Column Name | Required? | Description | Example |
|-------------|-----------|-------------|---------|
| `project_name` | ✅ | Project name | `Smart Bin` |
| `project_code` | ✅ | Project code | `IOT-01` |
| `team_lead_name` | ✅ (first row only) | Team lead name | `Rahul Kumar` |
| `team_lead_phone` | ✅ (first row only) | Team lead phone | `9876543210` |
| `name` | ✅ | Member name | `Rahul Kumar` |
| `college` | ✅ | College name | `IIT Delhi` |
| `branch` | ✅ | Branch/department | `CSE` |
| `year_of_passing` | ✅ | Graduation year | `2026` |
| `phone` | ❌ | Member phone | `9876543210` |
| `food_preference` | ❌ | veg or non-veg (default: veg) | `veg` |

**Important Rules:**
- Rows with the **same `project_code`** are grouped into **one team**
- The **first row** of each team must have `team_lead_name` and `team_lead_phone`
- Subsequent rows of the same team can leave those columns empty

**Example Excel:**

| project_name | project_code | team_lead_name | team_lead_phone | name | college | branch | year_of_passing | food_preference |
|-------------|-------------|----------------|-----------------|------|---------|--------|----------------|-----------------|
| Smart Bin | IOT-01 | Rahul Kumar | 9876543210 | Rahul Kumar | IIT Delhi | CSE | 2026 | veg |
| Smart Bin | IOT-01 | | | Priya Patel | IIT Delhi | ECE | 2027 | non-veg |
| Smart Bin | IOT-01 | | | Amit Singh | IIT Delhi | ME | 2026 | veg |
| EcoTrack | ENV-02 | Neha Sharma | 9123456789 | Neha Sharma | NIT Trichy | IT | 2026 | veg |
| EcoTrack | ENV-02 | | | Ravi Gupta | NIT Trichy | CSE | 2027 | non-veg |

This creates 2 teams: "Smart Bin" (3 members) and "EcoTrack" (2 members)

#### Step 3: Upload & Import

1. On the Import page, click **"Choose File"** or **drag-and-drop** your Excel file
2. The system parses the file and shows a **preview table** of all teams found
3. Review the preview:
   - Each team shows: project name, member count, and member details
   - Check for any parsing errors (shown in red)
4. If everything looks correct, click the **"Import All" button**
5. A progress indicator shows import status
6. When complete, a green notification appears: *"X teams imported successfully"*
7. Imported teams appear with "pending" status in the teams list

---

## 6. Phase 5: Approving Teams

### Who does this: Registration Committee

### Step 1: Go to Teams List

1. Log in with your Google account (the email the Super Admin added)
2. Click **"Dashboard"** in the navbar
3. You're taken to `/{eventId}/teams` (the Team Registration page)

**What you see on this page:**

- **Top:** Page title "Team Registration" and event name
- **Stats row (4 boxes):**
  - **Total Teams** — All registered teams
  - **Pending** — Waiting for approval (highlighted with yellow border if > 0)
  - **Approved** — Already approved
  - **Total Members** — Total attending members
- **Food stats card:** Shows **Vegetarian** count (green) on the left and **Non-Vegetarian** count (red) on the right with a divider between them
- **Below:** The actual **list of teams**

### Step 2: Review Teams

Each team in the list shows:
- **Team Code** (e.g., "IGN26-A1B2")
- **Project Name**
- **Status badge:**
  - 🟡 **Pending** (yellow) — Needs your action
  - 🟢 **Approved** (green) — Already approved
  - 🔴 **Rejected** (red) — Already rejected
- **Team Lead Name** and phone number
- Member count

### Step 3: Approve or Reject

For each **pending** team:

1. Click on the team to expand its details
2. You see all member information: names, colleges, branches, food preferences
3. You see two buttons:
   - **"Approve" button** (green) — Click to approve the team
   - **"Reject" button** (red) — Click to reject the team

**When you click "Approve":**
- A green notification appears: *"Team approved"*
- The status badge changes from 🟡 Pending to 🟢 Approved
- **Automatically:** Food coupons are generated for ALL team members (lunch, tea, dinner, kit coupons)
- The team can now access their Team Portal

**When you click "Reject":**
- A confirmation dialog may appear
- The status badge changes to 🔴 Rejected
- The team is informed

---

## 7. Phase 6: Team Portal (For Participants)

### Who uses this: Team members / Team leads

### Step 1: Go to Team Portal

1. Open the website in your browser
2. In the navbar, click **"Team Portal"** (or go to `/team`)
3. You see a centered card with:
   - 🎫 icon at the top
   - **"Team Portal"** heading
   - "Access your team dashboard" subtitle
   - A **toggle switch** with two options

### Step 2: Choose Access Method

At the top of the form, you see a **toggle bar with two tabs**:

| Tab | Label | When to Use |
|-----|-------|-------------|
| Left tab (selected by default) | **📱 Phone Number** | Use the team lead's phone number |
| Right tab | **🔑 Team Code** | Use the team code (e.g., IGN26-A1B2) |

**To switch:** Click the tab you want. The selected tab appears with a white/highlighted background.

### Option 1: Access with Phone Number (Default, Easier)

1. The toggle should already show **📱 Phone Number** (highlighted)
2. In the text field, type the **team lead's phone number** (the one entered during registration)
3. Click the blue **"Access Team"** button
4. **If found:** You're redirected to your team dashboard
5. **If not found:** A red error message appears: *"No team found with this phone number. Make sure to use the team lead's phone number."*

### Option 2: Access with Team Code

1. Click the **🔑 Team Code** tab on the toggle bar
2. The input field changes — now shows placeholder "IGN26-XXXX"
3. Type your team code (e.g., `IGN26-A1B2`) — it auto-converts to uppercase
4. Click the blue **"Access Team"** button
5. **If found:** You're redirected to your team dashboard
6. **If not found:** Red error: *"Team not found. Please check your team code."*

### Step 3: Using the Team Dashboard

Once you access your team, you see your **Team Dashboard** at `/team/[teamCode]`:

**What you see:**

1. **Team Info Section:**
   - Project Name
   - Team Code
   - Status badge (Pending / Approved / Rejected)

2. **Members List:**
   Each member shows as a card with:
   - Member number badge (e.g., #1, #2)
   - Name with prefix (Mr/Ms)
   - College & Branch
   - Attendance status badge (green "Attending" or gray "Not Attending")
   - Food preference

3. **What Members Can Update:**

   **Food Preference:** Each member has a dropdown showing "Vegetarian" or "Non-Vegetarian". Click it and select a different option → Green notification: *"Food preference updated"*

   **Accommodation:** If the event has accommodation:
   - Click **"Need Accommodation"** toggle
   - Select room type: **Dorm** or **Suite**
   - Select dates (day before, event day, day after)
   - Changes save automatically

4. **At the bottom:** "Don't have a team yet?" → Link to **"Register Now →"** takes you to the events page

---

## 8. Phase 7: Setting Up Jury & Evaluation

### Who does this: Jury Admin

### Step 1: Go to Jury Admin Dashboard

1. Log in with your Google account
2. Click **"Dashboard"** in the navbar → You're taken to `/{eventId}/jury`

**What you see:**

- **Top:** "Jury Admin Dashboard" heading with event name
- **Stats row (4 boxes):**
  - **Questions** — Number of evaluation questions created
  - **Jury Members** — Number of jury members assigned
  - **Submitted** — Evaluations submitted by jury
  - **Pending** — Evaluations still in progress
- **Two cards side by side:**
  - **Left: "Evaluation Questions"** — Create and manage questions
  - **Right: "Jury Members"** — Assign teams to jury members
- **Below: "Evaluation Progress"** — Monitor all evaluation submissions
- **Bottom: "Team Rankings"** — Leaderboard (appears after evaluations are submitted)

### Step 2: Create Evaluation Questions

1. Look at the **left card** titled **"Evaluation Questions"** with subtitle "Define criteria for team evaluation"
2. You see a form to add a new question with these fields:

| Field | What to Enter | Example |
|-------|--------------|---------|
| **Question Text** | What to evaluate | `Innovation and Creativity` |
| **Max Score** | Maximum score for this question | `10` |
| **Weight** | How much this counts in the final score | `25` |

3. Fill in all three fields
4. Click the **"Add Question"** button
5. The question appears in the list below with its text, max score, and weight
6. Repeat for all your questions

**Recommended Questions:**

| Question | Max Score | Weight |
|----------|----------|--------|
| Innovation & Creativity | 10 | 25 |
| Technical Implementation | 10 | 30 |
| Presentation & Communication | 10 | 15 |
| Impact & Usefulness | 10 | 20 |
| Team Coordination | 10 | 10 |
| **Total Weight** | | **100** |

**To edit a question:** Click the "Edit" button next to it, modify the fields, click "Save"
**To delete a question:** Click the "Delete" button (red) next to it, confirm the deletion

### Step 3: Assign Teams to Jury Members

> ⚠️ **Important:** Teams must be **approved** first before you can assign them to jury members. Ask the Registration Committee to approve teams first.

1. Look at the **right card** titled **"Jury Members"** with subtitle "Assign teams to jury members"
2. You see the list of jury members (added by Super Admin in Committee Members section)
3. For each jury member, you can assign which teams they evaluate
4. Click **"Assign Teams"** next to a jury member
5. A list of approved teams appears with checkboxes
6. **Check the teams** you want this jury member to evaluate
7. Click **"Save Assignments"**
8. The jury member now sees those teams in their evaluation dashboard

**Best practice:** Distribute teams **evenly** across jury members. If you have 20 teams and 4 jury members, assign 5 teams to each.

---

## 9. Phase 8: Event Day — QR Scanning & Logistics

### Who does this: Logistics Committee

### Step 1: Go to Logistics Dashboard

1. Log in with your Google account
2. Click **"Dashboard"** in the navbar → You're taken to `/{eventId}/logistics`

**What you see on this page:**

- **Top:** "Logistics & QR Scanner" heading with event name
- **"← Back to Event" button** in the top-right corner
- **Stats row (4 boxes):**
  - **Total Coupons** — All generated coupons
  - **Used** (green border) — Coupons already scanned
  - **Remaining** — Coupons not yet used
  - **Usage %** — Percentage used
- **Type-wise stats (4 cards):**
  - 🍽️ **Lunch** — X / Y used
  - ☕ **Tea** — X / Y used
  - 🌙 **Dinner** — X / Y used
  - 🎁 **Kit** — X / Y used
  - Each card has a **progress bar** showing usage visually

### Step 2: Use the QR Scanner

Below the stats, you see a card titled **"📱 QR Scanner"** with subtitle "Scan or enter coupon code":

**Method 1: Scan QR Code**
1. If your device has a camera, the scanner opens automatically
2. Point your camera at the team member's QR code
3. The system automatically reads the code
4. If valid: Green notification *"Coupon marked as used"*
5. If already used: Red notification *"Coupon already used"*

**Method 2: Manual Entry (Backup)**
1. Below the scanner, there's a **text input field** with placeholder text
2. Type the coupon code manually (e.g., `IGN26-A1B2-LUNCH-001`)
3. Click the **"Verify"** button (or press Enter)
4. The system checks the coupon and shows the result

### Step 3: View Recent Scans

Below the scanner, you see a card titled **"Recent Scans"** showing the last 20 scanned coupons:

Each scan shows:
- **Member Name** (bold)
- **Coupon Code** (gray text)
- **Type badge** (green badge showing "lunch", "tea", "dinner", or "kit")
- **Time** (when it was scanned)

---

## 10. Phase 9: Event Day — Food Management

### Who does this: Food Committee / Logistics Committee

### Step 1: Go to Food Dashboard

1. Log in with your Google account
2. Click **"Dashboard"** in the navbar → Go to `/{eventId}/food`

**What you see:**

- **Food preference overview:**
  - **Vegetarian count** (green number)
  - **Non-Vegetarian count** (red number)
- **Coupon statistics:** Meal-type breakdown with progress bars
- **Live stats** of what's been served vs. remaining

### Step 2: Scan Food Coupons

Same QR scanner as the Logistics page. The process:

1. Team member shows their food coupon (QR code on their phone or printed)
2. Scan it or enter the code manually
3. System checks:
   - ✅ Is this coupon valid? (exists in the system)
   - ✅ Is it the right meal time? (lunch coupon can't be used at dinner)
   - ✅ Has it already been used? (prevents double use)
4. **If valid:** Green success → Allow the person to get food
5. **If invalid:** Red error → Explain why (already used, wrong meal, etc.)

---

## 11. Phase 10: Jury Evaluation (For Jury Members)

### Who does this: Jury Members

### Step 1: Go to Your Evaluation Page

1. Log in with your Google account
2. Click **"Dashboard"** in the navbar
3. You're taken to `/{eventId}/jury/evaluate`

**What you see:**
- **"Your Assigned Teams"** heading
- A list of teams assigned to you by the Jury Admin
- Each team shows:
  - Team Code
  - Project Name
  - Status: "Not Started", "Draft", "Submitted"

### Step 2: Evaluate a Team

1. Click on a team from your assigned list
2. You're taken to the evaluation form for that team at `/{eventId}/jury/evaluate/[submissionId]`
3. You see all the evaluation questions created by the Jury Admin

**For each question:**
- Question text is displayed (e.g., "Innovation and Creativity")
- A **score slider** or **number input** (0 to max score)
- Move the slider or type a number to set your score
- **Optional:** Add a comment for that specific question

**At the bottom:**
- **Overall Comment** text area — Add your general feedback about the team
- **"Save Draft"** button (gray) — Save progress, come back later
- **"Submit Evaluation"** button (blue) — Final submission

### Step 3: Save or Submit

**Save Draft:**
- Click **"Save Draft"** → Green notification: *"Draft saved"*
- Your evaluation shows as "Draft" status
- You can come back and edit it later
- ⚠️ Save frequently to avoid losing work

**Submit (Final):**
- Click **"Submit Evaluation"** → Confirmation dialog appears
- Click **OK** to confirm
- Green notification: *"Evaluation submitted"*
- Status changes to "Submitted"
- ⚠️ After submission, you typically **cannot edit** the evaluation
- The Jury Admin can "send back" if changes are needed

### Step 4: Move to Next Team

1. After submitting, you're redirected back to your team list
2. The submitted team now shows ✅ "Submitted" status
3. Click the next team and repeat the process

---

## 12. Phase 11: Announcements

### Who does this: Any committee member

### Step 1: Go to Announcements

1. Go to `/{eventId}/announcements` (from the Dashboard → Quick Access → 📢 Announcements card)

**What you see:**
- **"Announcements"** heading with event name
- **Create announcement form** at the top
- **List of existing announcements** below

### Step 2: Create an Announcement

1. Fill in the form:
   - **Title** — Short headline (e.g., "Lunch is Ready!")
   - **Content** — Full message (e.g., "All teams please proceed to Hall 2 for lunch. Veg on left side, Non-veg on right side.")
   - **Category** — Select from dropdown: General, Food, Logistics, Jury, etc.
   - **Priority** — Normal or High
2. Click the **"Post Announcement"** button
3. The announcement appears at the top of the list

### Step 3: Delete an Announcement

- Find the announcement in the list
- Click the **"Delete"** button (red, usually a trash icon or ✕)
- Confirm deletion

### Where Announcements Appear

- **Volunteer Page** (`/volunteer`) — Visible to everyone without logging in
- **Announcements Page** (`/{eventId}/announcements`) — Full list with filtering
- Announcements can be **filtered by category** using the filter buttons at the top

---

## 13. Phase 12: Accommodation & Commute

### Accommodation Management

**Path:** `/{eventId}/accommodation`

**For Team Members:**
- In their Team Portal (`/team/[teamCode]`), each member can:
  1. Toggle **"Need Accommodation"** to ON
  2. Select **Room Type**: Dorm or Suite
  3. Select **Dates**: Check the checkboxes for needed nights (day before / event day / day after)
  4. Changes save automatically — green notification appears

**For Accommodation Admin:**
- Go to `/{eventId}/accommodation`
- See all accommodation requests organized by:
  - **Date-wise breakdown** — How many people need rooms on each night
  - **Room type stats** — Dorm vs. Suite counts
- Export the list for hostel/hotel coordination

### Commute/Bus Schedules

**Path:** `/{eventId}/commute`

**For Commute Admin:**
- Add bus schedules: Route name, departure time, available seats
- Edit or delete existing schedules

**For Participants:**
- Go to `/volunteer` → See bus schedules
- Each schedule shows: route, time, and available seats

---

## 14. Phase 13: Exporting Data

### Who does this: Committee Members / Super Admin

### Step 1: Go to Event Dashboard

1. Log in and click **"Dashboard"** in navbar
2. Go to `/{eventId}/dashboard`
3. Scroll down past the stats and Quick Access cards
4. You see a section titled **"Export Data"**

### Step 2: Export Everything at Once (Recommended)

1. At the top of the Export Data section, you see a **large blue button:**
   > **📦 Export All Data (ZIP)**
2. Below it is gray text: "Download all event data (teams, food, coupons, accommodation, evaluations, attendance) in one ZIP file"
3. **Click the button**
4. Your browser downloads a ZIP file named `{EventName}_AllData_{date}.zip`
5. **Unzip the file** — Inside you'll find 6 Excel files:
   - `teams.xlsx` — All team details with every member
   - `food.xlsx` — Food preferences for all attending members
   - `coupons.xlsx` — All coupons with usage status
   - `accommodation.xlsx` — Accommodation requests
   - `evaluations.xlsx` — All jury scores and rankings
   - `attendance.xlsx` — Meal attendance records (used coupons)

### Step 3: Export Individual Files (Alternative)

Below the Export All button, you see gray text: **"Or export individually:"** followed by 6 smaller buttons:

| Button | What It Downloads |
|--------|------------------|
| **Teams** | All team details with members |
| **Food Report** | Food preferences (veg/non-veg counts) |
| **Coupons** | All coupons with usage status |
| **Accommodation** | Accommodation requests |
| **Evaluations** | Jury scores and rankings |
| **Attendance** | Meal attendance log |

Click any button → An Excel file (.xlsx) downloads to your device.

---

## 15. Phase 14: Post-Event & Archiving

### Step 1: Lock All Evaluations (Jury Admin)

1. Go to `/{eventId}/jury` → Look at the **"Evaluation Progress"** card at the bottom
2. For each **submitted** evaluation:
   - Click **"Lock"** → The evaluation is finalized (green "Locked" status)
   - If there's an issue, click **"Send Back"** → Jury member can revise and resubmit
3. Make sure all evaluations are locked before generating final results

### Step 2: View Final Rankings

1. On the same Jury Admin page, scroll to the **"Team Rankings"** section at the very bottom
2. You see teams ranked by average score:
   - **#1** — Gold circle with score on the right
   - **#2** — Silver circle
   - **#3** — Bronze circle
   - #4 onwards — Gray circle
3. Each entry shows: rank, team code, project name, average score, and number of evaluations

### Step 3: Export All Data

Follow the steps in [Phase 13: Exporting Data](#14-phase-13-exporting-data) to download everything.

### Step 4: Archive the Event (Super Admin)

1. Go to `/admin` → Click **"Manage Event →"** on your event card
2. In the **"Event Settings"** card on the left
3. Under **"Event Status"**, click the **"Archived"** button
4. The event:
   - Moves to the "Archived Events" section on the admin dashboard
   - Is no longer visible on the public events page
   - All data is preserved and can still be accessed
   - Registration and evaluation are automatically closed

---

## 16. Troubleshooting & Common Scenarios

### ❌ "I can't see the Dashboard link in the navbar"

**Cause:** You're not logged in, or you haven't been assigned a role.
**Fix:**
1. Click **"Staff Login"** (blue button, top-right) → Sign in with Google
2. If still no Dashboard link → Your email hasn't been added as a committee member
3. Ask the Super Admin to go to `/admin/events/[eventId]` → Committee Members → Add your exact Google email

### ❌ "Access Denied" or "Unauthorized" page

**Cause:** You don't have permission for that specific page.
**Fix:**
1. Check with the Super Admin that you have the **correct role** for that page
2. Example: If you see "Access Denied" on `/teams`, you need the "Registration Committee" role
3. Super Admin can add your role at `/admin/events/[eventId]` → Committee Members

### ❌ "Team not found" on Team Portal

**Cause:** Wrong phone number or team code entered.
**Fix:**
1. If using **Phone Number**: Make sure you're entering the **team lead's** phone number (not a member's phone)
2. If using **Team Code**: Check for typos — codes look like `IGN26-XXXX` (always uppercase)
3. If the team hasn't been approved yet, the portal still works — the status will show "Pending"

### ❌ "My team was registered but I don't have a team code"

**Cause:** You may not have noted it during registration.
**Fix:**
1. Use the **📱 Phone Number** tab on the Team Portal instead
2. Enter the team lead's phone number
3. Or ask the Registration Committee to look it up in `/{eventId}/teams`

### ❌ "QR Scanner camera not working"

**Cause:** Browser doesn't have camera permission, or device has no camera.
**Fix:**
1. When prompted, click **"Allow"** for camera access
2. If no camera is available, use **Manual Entry** instead:
   - Type the coupon code in the text field
   - Click "Verify" button

### ❌ "Coupon shows 'Already Used'"

**Cause:** This coupon was already scanned earlier.
**Fix:**
1. Check the **"Recent Scans"** section on the Logistics page to see when/who scanned it
2. This prevents double-usage (one coupon = one meal)
3. If it was scanned by mistake, contact the Super Admin

### ❌ "Jury member can't see their assigned teams"

**Cause:** Teams haven't been assigned yet, or evaluation isn't open.
**Fix:**
1. **Jury Admin** must assign teams: Go to `/{eventId}/jury` → Jury Members card → Assign Teams
2. **Super Admin** must turn on evaluation: Go to `/admin/events/[eventId]` → Toggle **"Evaluation Open"** to ON

### ❌ "Jury evaluation won't save"

**Cause:** Missing required scores or network issue.
**Fix:**
1. Make sure **every question has a score** (can't be blank)
2. Add an overall comment (may be required)
3. Check internet connection
4. Try clicking **"Save Draft"** first, then submit later

### ❌ "I'm Super Admin but I see a blank admin page"

**Cause:** Your Google email doesn't match `SUPER_ADMIN_EMAIL` in environment variables.
**Fix:**
1. Check your Netlify environment variables
2. The email must exactly match your Google sign-in email (case-sensitive: `nihal@gmail.com`)
3. After fixing, redeploy on Netlify

### 🔄 Scenario: Late Team Registration After Deadline

1. **Super Admin** goes to `/admin/events/[eventId]` → Toggle **"Registration Open"** back ON
2. The team registers normally at `/events/[eventId]/register`
3. OR Super Admin uses the **Import page** (`/{eventId}/import`) to add just one team via Excel
4. Registration Committee approves immediately at `/{eventId}/teams`
5. Toggle Registration back OFF if needed

### 🔄 Scenario: Need to Change a Team Member After Approval

1. Currently, team members can update their own info in the Team Portal
2. For major changes, Registration Committee can reject the team
3. The team re-registers with corrected information
4. Registration Committee re-approves

---

## 17. Complete Route Reference

### Public Pages (No Login Required)

| URL | Page Name | What You See |
|-----|-----------|-------------|
| `/` | Home Page | Landing page with IGNITE branding |
| `/events` | Events List | All active events, click to register |
| `/events/{eventId}/register` | Registration Form | Fill in team details (Google login required) |
| `/team` | Team Portal Entry | Enter phone/code to access team dashboard |
| `/team/{teamCode}` | Team Dashboard | View/edit team details, food, accommodation |
| `/volunteer` | Volunteer Page | Announcements and bus schedules |
| `/accommodation` | Accommodation Info | View accommodation options |

### Staff Pages (Login Required)

| URL | Required Role | Page Name | What You See |
|-----|--------------|-----------|-------------|
| `/my-dashboard` | Any role | Smart Dashboard | Auto-redirects to your role's page |
| `/admin` | Super Admin | Admin Dashboard | All events, create/manage events |
| `/admin/users` | Super Admin | User Management | View all users, promote to admin |
| `/admin/events/new` | Super Admin | Create Event | Form to create a new event |
| `/admin/events/{id}` | Super Admin | Manage Event | Settings, committee members, quick links |
| `/{eventId}/dashboard` | Any committee | Event Dashboard | Stats, quick access, export data |
| `/{eventId}/teams` | Registration Committee | Teams List | View, approve, reject team registrations |
| `/{eventId}/import` | Reg. Committee / Admin | Import Teams | Upload Excel to bulk-import teams |
| `/{eventId}/jury` | Jury Admin | Jury Dashboard | Questions, assignments, submissions, rankings |
| `/{eventId}/jury/evaluate` | Jury Member | Evaluate Teams | See assigned teams, submit scores |
| `/{eventId}/jury/evaluate/{id}` | Jury Member | Evaluation Form | Score a specific team |
| `/{eventId}/food` | Food Committee | Food Dashboard | Veg/non-veg stats, coupon usage |
| `/{eventId}/logistics` | Logistics Committee | QR Scanner | Scan coupons, mark attendance |
| `/{eventId}/announcements` | Any committee | Announcements | Post and manage announcements |
| `/{eventId}/accommodation` | Accommodation Admin | Accommodation | Room assignments, date breakdown |
| `/{eventId}/commute` | Commute Admin | Bus Schedules | Create/edit bus routes and times |

### API Routes (Used Internally)

| URL | Purpose |
|-----|---------|
| `/api/auth/[...nextauth]` | Google OAuth authentication |
| `/api/export/{eventId}/{type}` | Download individual Excel export |
| `/api/export-all/{eventId}` | Download all data as ZIP |

---

## Quick Checklist: Running an Event from Start to Finish

### 📅 2-3 Weeks Before

- [ ] Super Admin: Deploy the app
- [ ] Super Admin: Create the event (`/admin` → "+ Create New Event")
- [ ] Super Admin: Set event to "Active" (`/admin/events/{id}` → Status → Active)
- [ ] Super Admin: Turn ON registration (`/admin/events/{id}` → Registration Open toggle)
- [ ] Super Admin: Add committee members (`/admin/events/{id}` → Committee Members)
- [ ] Share registration link with teams: `yoursite.com/events`

### 📅 1 Week Before

- [ ] Jury Admin: Create evaluation questions (`/{eventId}/jury` → Questions card)
- [ ] Registration Committee: Review and approve teams (`/{eventId}/teams`)
- [ ] Test the system: Create a dummy team and go through the full flow

### 📅 1 Day Before

- [ ] Super Admin: Verify all teams are approved/rejected
- [ ] Jury Admin: Assign teams to jury members (`/{eventId}/jury` → Jury Members card)
- [ ] Logistics: Test QR scanners
- [ ] Super Admin: Turn ON evaluation (`/admin/events/{id}` → Evaluation Open toggle)

### 📅 Event Day

- [ ] Logistics Committee: Scan attendance at registration desk (`/{eventId}/logistics`)
- [ ] Food Committee: Scan food coupons at meal times (`/{eventId}/logistics`)
- [ ] Committee: Post announcements as needed (`/{eventId}/announcements`)
- [ ] Jury Members: Evaluate assigned teams (`/{eventId}/jury/evaluate`)

### 📅 After Event

- [ ] Jury Admin: Lock all evaluations (`/{eventId}/jury` → Submissions → Lock)
- [ ] Jury Admin: View rankings (`/{eventId}/jury` → Team Rankings)
- [ ] Super Admin: Export all data (`/{eventId}/dashboard` → 📦 Export All Data)
- [ ] Super Admin: Archive event (`/admin/events/{id}` → Status → Archived)

---

> **Need help?** Contact the Super Admin or create a GitHub issue at the project repository.
>
> **IGNITE V2** — Built for Darsana IGNITE event management 🔥
