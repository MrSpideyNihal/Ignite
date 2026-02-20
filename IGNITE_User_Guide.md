# IGNITE V2 — Complete User Guide

> **This guide tells you exactly what to click, where to find it, and what happens next.**
> Written for users and testers who have never used the system before.

---

## 📋 Table of Contents

1. [Understanding the Navigation Bar](#1-understanding-the-navigation-bar)
2. [Logging In](#2-logging-in)
3. [Super Admin: Creating & Managing Events](#3-super-admin-creating--managing-events)
4. [Super Admin: Assigning Committee Members](#4-super-admin-assigning-committee-members)
5. [Team Registration (For Participants)](#5-team-registration-for-participants)
6. [Bulk Import Teams via Excel](#6-bulk-import-teams-via-excel)
7. [Approving Teams (Registration Committee)](#7-approving-teams-registration-committee)
8. [Team Portal (For Participants)](#8-team-portal-for-participants)
9. [Setting Up Jury & Evaluation (Jury Admin)](#9-setting-up-jury--evaluation-jury-admin)
10. [QR Scanning & Logistics](#10-qr-scanning--logistics)
11. [Food Management](#11-food-management)
12. [Jury Evaluation (For Jury Members)](#12-jury-evaluation-for-jury-members)
13. [Announcements](#13-announcements)
14. [Accommodation & Commute](#14-accommodation--commute)
15. [Exporting Data](#15-exporting-data)
16. [Post-Event & Archiving](#16-post-event--archiving)
17. [Troubleshooting & Common Scenarios](#17-troubleshooting--common-scenarios)
18. [Complete Route Reference](#18-complete-route-reference)
19. [Event Day Checklist](#19-event-day-checklist)

---

## 1. Understanding the Navigation Bar

The navigation bar is the **horizontal bar at the very top** of every page.

### If You Are NOT Logged In

You see these items from **left to right**:

| Position | What You See | What It Does |
|----------|-------------|-------------|
| Far left | 🔥 **IGNITE 2026** (fire icon + text) | Click to go to the home page |
| Middle | **Home** | Goes to the landing page |
| Middle | **Register Team** | Goes to the events list where you pick an event to register for |
| Middle | **Team Portal** | Enter your phone number or team code to check your team status |
| Far right | **Volunteer** (small gray button) | View event announcements and bus schedules |
| Far right | **Staff Login** (blue button) | Click to sign in with Google — only for admins and committee members |

### If You ARE Logged In

Everything above stays the same, plus:

| Position | What You See | What It Does |
|----------|-------------|-------------|
| After "Team Portal" | **Dashboard** (separated by a vertical line) | Takes you to your role-specific dashboard automatically |
| Far right | Your **name** + **Google profile photo** (small circle) | Shows who is logged in |
| Far right | **Logout** (gray button) | Signs you out |

### On Mobile Phone

- You see the 🔥 fire logo on the left and a **☰ menu icon** (three horizontal lines) on the right
- **Tap the ☰ icon** to open a dropdown menu with all the same links
- Tap any link to navigate; the menu closes automatically

---

## 2. Logging In

### Who Needs to Log In?
- **Super Admins** (event organizers)
- **Committee Members** (registration, jury, food, logistics)
- **Teams registering** for an event (Google sign-in required before filling the form)

**Note:** Team Portal access (`/team`) does NOT require login — anyone can check their team using phone number or team code.

### How to Log In

1. Look at the **top-right corner** of the page
2. Click the **blue "Staff Login" button**
3. A Google sign-in window opens
4. Select your Google account (must be the same email the Super Admin added for your role)
5. After sign-in, you return to the website
6. Your **name and profile photo** now appear in the top-right corner
7. A **"Dashboard"** link appears in the navbar — click it to go to your dashboard

### How to Log Out

1. Click the **gray "Logout" button** in the top-right corner (next to your profile photo)
2. You're signed out and returned to the home page

---

## 3. Super Admin: Creating & Managing Events

### Go to Admin Dashboard

1. Log in with Google (your email must match the Super Admin email)
2. Click **"Dashboard"** in the navbar
3. You land on the **Super Admin Dashboard** page

**What you see:**
- At the top, two buttons side by side:
  - **"+ Create New Event"** (blue filled button on the left)
  - **"Manage Global Users"** (outlined button on the right)
- Below that, three sections:
  - **Active Events** — Events currently running (visible to public)
  - **Draft Events** — Events being prepared (not visible to public)
  - **Archived Events** — Past completed events

### Create a New Event

1. Click the **blue "+ Create New Event" button** at the top
2. You're taken to a form page. Fill in every field:

| Field | What to Type | Example |
|-------|-------------|---------|
| **Event Name** | Full event name | `IGNITE 2026` |
| **Year** | Event year | `2026` |
| **Date** | Click the calendar icon, pick a date | `15 March 2026` |
| **Venue** | Event location | `IIT Delhi Campus` |
| **Description** | Short description | `Annual innovation hackathon` |
| **Max Team Size** | Maximum members per team | `5` |

3. Click the **"Create Event"** button at the bottom of the form
4. ✅ Green notification: *"Event created successfully"*
5. You're redirected back to the admin dashboard
6. Your event appears under **"Draft Events"** as a card

### Activate the Event (Make It Visible)

1. On the admin dashboard, find your event card under **"Draft Events"**
2. Click the **"Manage Event →"** button at the bottom of the card
3. You're taken to the **Event Management** page
4. On the **left side**, look for the card titled **"Event Settings"**
5. Under **"Event Status"**, you see three buttons in a row:
   - **Draft** (currently blue/highlighted)
   - **Active**
   - **Archived**
6. Click the **"Active"** button
7. ✅ It turns blue. Green notification: *"Event status updated"*
8. Your event is now visible on the public events page

### Open/Close Registration

On the same Event Management page, below the status buttons:

1. You see two **toggle switches** (small sliding pills):
   - **Registration Open** — Slide right to turn ON (turns blue), slide left to turn OFF (turns gray)
   - **Evaluation Open** — Same toggle, controls whether jury can evaluate
2. To **open registration**: Click the "Registration Open" toggle so it turns **blue**
3. ✅ Green notification: *"Settings updated"*
4. Teams can now register for your event

### Open/Close Evaluation

- Toggle **"Evaluation Open"** to **ON** when you want jury members to start evaluating
- Toggle it **OFF** when evaluation period is over

---

## 4. Super Admin: Assigning Committee Members

### Where to Do This

1. Go to Admin Dashboard (click **"Dashboard"** in navbar)
2. Find your event card → Click **"Manage Event →"**
3. Look at the **right side card** titled **"Committee Members"** with subtitle "Manage roles for this event"

### Add a Committee Member

Inside the "Committee Members" card, you see three things in a row:

1. **Text input box** (placeholder: "email@gmail.com") — Type the person's **exact Google email** here
2. **Dropdown menu** — Click it to see role options:

| Role Option | What This Person Can Do |
|-------------|------------------------|
| **Jury Admin** | Create evaluation questions, assign teams to jury members, lock evaluations |
| **Jury Member** | Evaluate teams assigned to them, submit scores |
| **Registration Committee** | View all teams, approve or reject registrations |
| **Food Committee** | View food preferences dashboard, manage coupons |
| **Logistics Committee** | Use QR scanner for attendance, scan food coupons |

3. **"Add" button** (small blue button) — Click to assign the role

**Steps:**
1. Type the person's Google email (e.g., `bablu@gmail.com`)
2. Click the dropdown → Select a role (e.g., "Registration Committee")
3. Click the **"Add"** button
4. ✅ Green notification: *"Role assigned"*
5. The person's name, email, and role badge appear in the list below

### Remove a Committee Member

1. In the list below, each member shows: **Name** (bold), **email** (gray), **role badge** (blue), and a **red ✕ button**
2. Click the **red ✕ button** next to the person
3. A popup asks: "Remove this role?"
4. Click **OK**
5. The person is removed from the list

### Quick Access Cards (Below)

Below the two main cards, you see **4 shortcut cards** in a row:

| Icon | Label | Goes To |
|------|-------|---------|
| 👥 | **Teams** | Team registrations list |
| ⚖️ | **Jury** | Jury management |
| 🍽️ | **Food** | Food preferences dashboard |
| 📱 | **QR Scanner** | QR scanning & attendance page |

Click any card to jump to that section directly.

---

## 5. Team Registration (For Participants)

### Step 1: Find the Event

1. Open the website
2. In the navbar, click **"Register Team"**
3. You see a list of active events as cards (each shows event name, date, venue)
4. Click the **"Register →"** button on your event's card

### Step 2: Sign In (Required)

1. If you're not signed in, you see: *"You need to sign in with Google before registering"*
2. Click the **"Sign in with Google"** button (large blue button)
3. Google sign-in window → Select your account
4. After sign-in, the registration form appears

### Step 3: Fill the Registration Form

**Project Details (Required)**

| Field | What to Type | Example |
|-------|-------------|---------|
| **Project Name** | Full name of your project | `Smart Waste Bin` |
| **Project Code** | Short code given by organizers | `IOT-01` |

**Team Lead Details (Required)**

| Field | What to Type | Example |
|-------|-------------|---------|
| **Team Lead Name** | Full name of team leader | `Rahul Kumar` |
| **Team Lead Email** | Leader's email | `rahul@gmail.com` |
| **Team Lead Phone** | 10-digit phone number ⚠️ **REMEMBER THIS — needed to access Team Portal later** | `9876543210` |

**Guide Details (Optional — skip if no guide/mentor)**

| Field | What to Type |
|-------|-------------|
| **Guide Name** | Name of teacher/mentor |
| **Guide Email** | Guide's email |
| **Guide Phone** | Guide's phone |

**Team Members**

For each member, you see a card with these fields:

| Field | What to Fill | Required? |
|-------|-------------|-----------|
| **Prefix** | Click dropdown → Mr / Ms / Dr / N/A | ✅ |
| **Name** | Full name | ✅ |
| **College** | College/university name | ✅ |
| **Branch** | Department (CSE, ECE, etc.) | ✅ |
| **Year of Passing** | Graduation year (e.g., 2026) | ✅ |
| **Phone** | 10-digit phone number | Optional |
| **Email** | Email address | Optional |
| **Food Preference** | Click dropdown → Vegetarian / Non-Vegetarian | ✅ |

- **To add more members:** Click **"+ Add Member"** button below the member cards
- **To remove a member:** Click the **red "Remove"** button on that member's card
- Maximum members is shown (set by the event organizer)

### Step 4: Submit

1. Click the **blue "Register Team" button** at the bottom
2. **If successful:** A green box appears with your **Team Code** (e.g., `IGN26-A1B2`)
3. ⚠️ **WRITE DOWN YOUR TEAM CODE** — you need it to access Team Portal
4. **If error:** A red box explains what's wrong (e.g., "Project name required"). Fix it and try again.

---

## 6. Bulk Import Teams via Excel

### Who Does This: Super Admin or Registration Committee

### Step 1: Go to Import Page

1. Log in → Click **"Dashboard"** in navbar
2. On the Event Dashboard, under **"Quick Access"**, find the card with **📥 icon** labeled **"Import Teams"**
3. Click it

### Step 2: Prepare Your Excel File

Create an Excel file (`.xlsx`) with these columns:

| Column | Required? | Example |
|--------|-----------|---------|
| `project_name` | ✅ | `Smart Bin` |
| `project_code` | ✅ | `IOT-01` |
| `team_lead_name` | ✅ (first row of each team) | `Rahul Kumar` |
| `team_lead_phone` | ✅ (first row of each team) | `9876543210` |
| `name` | ✅ | `Rahul Kumar` |
| `college` | ✅ | `IIT Delhi` |
| `branch` | ✅ | `CSE` |
| `year_of_passing` | ✅ | `2026` |
| `phone` | Optional | `9876543210` |
| `food_preference` | Optional (default: veg) | `veg` or `non-veg` |

**Rule:** Rows with the **same `project_code`** become **one team**. First row must have team lead info; other rows can leave team lead columns empty.

**Example:**

| project_name | project_code | team_lead_name | team_lead_phone | name | college | branch | year_of_passing | food_preference |
|---|---|---|---|---|---|---|---|---|
| Smart Bin | IOT-01 | Rahul | 9876543210 | Rahul Kumar | IIT Delhi | CSE | 2026 | veg |
| Smart Bin | IOT-01 | | | Priya Patel | IIT Delhi | ECE | 2027 | non-veg |
| EcoTrack | ENV-02 | Neha | 9123456789 | Neha Sharma | NIT Trichy | IT | 2026 | veg |

This creates 2 teams: "Smart Bin" (2 members) and "EcoTrack" (1 member).

### Step 3: Upload

1. Click **"Choose File"** or drag-and-drop your Excel file
2. A preview table shows all parsed teams
3. Review for errors (shown in red)
4. Click the **"Import All"** button
5. ✅ Green notification: *"X teams imported successfully"*
6. Teams appear as "pending" in the teams list (need approval)

---

## 7. Approving Teams (Registration Committee)

### Step 1: Go to Teams List

1. Log in → Click **"Dashboard"** in navbar
2. You land on the Teams page (`/{eventId}/teams`)

**What you see:**
- **Page title:** "Team Registration" with event name below
- **4 stat boxes** in a row:
  - **Total Teams** — All registered teams
  - **Pending** — Waiting for your action (yellow border if > 0)
  - **Approved** — Already approved
  - **Total Members** — Total attending
- **Food stats card** in the middle: Green number for **Vegetarian**, Red number for **Non-Vegetarian**
- **Team list** below

### Step 2: Review Each Team

Each team in the list shows:
- **Team Code** (e.g., IGN26-A1B2)
- **Project Name**
- **Status badge:** 🟡 Pending / 🟢 Approved / 🔴 Rejected
- **Team Lead** name and phone
- **Member count**

### Step 3: Approve or Reject

1. Click on a pending team to expand its full details
2. Review member information (names, colleges, branches, food preferences)
3. Click one of the two buttons:

| Button | Color | What Happens |
|--------|-------|-------------|
| **Approve** | Green | Status → Approved. Food coupons auto-generated for ALL members . Team can now access Team Portal. |
| **Reject** | Red | Status → Rejected. |

✅ Green notification confirms the action.

---

## 8. Team Portal (For Participants)

### No Login Required — Anyone can use this

### Step 1: Go to Team Portal

1. In the navbar, click **"Team Portal"** (or go to `/team`)
2. You see a centered card with a 🎫 ticket icon

### Step 2: Choose How to Find Your Team

At the top of the card, you see a **toggle bar** with two tabs:

| Tab (click to select) | What to Enter |
|----------------------|---------------|
| **📱 Phone Number** (selected by default, highlighted) | Team lead's phone number |
| **🔑 Team Code** (click to switch) | Your team code (e.g., IGN26-A1B2) |

**Using Phone Number (easiest):**
1. The "📱 Phone Number" tab should already be highlighted
2. Type the **team lead's phone number** (10 digits) in the input field
3. Click the blue **"Access Team"** button
4. ✅ If found → You go to your team dashboard
5. ❌ If not found → Red error: *"No team found with this phone number. Make sure to use the team lead's phone number."*

**Using Team Code:**
1. Click the **"🔑 Team Code"** tab (it becomes highlighted)
2. The input field changes to show placeholder "IGN26-XXXX"
3. Type your team code — it auto-converts to uppercase
4. Click the blue **"Access Team"** button
5. ✅ If found → You go to your team dashboard
6. ❌ If not found → Red error: *"Team not found. Please check your team code."*

### Step 3: Your Team Dashboard

Once you access your team, you see:

1. **Team Info:** Project Name, Team Code, Status badge (Pending/Approved/Rejected)
2. **Members List:** Each member shown as a card with:
   - Number badge (#1, #2, etc.)
   - Name with prefix (Mr/Ms)
   - College & Branch
   - Green "Attending" badge or gray "Not Attending"
3. **What You Can Update:**
   - **Food Preference:** Click the dropdown on any member → Select Vegetarian or Non-Vegetarian → ✅ *"Food preference updated"*
   - **Accommodation:** Toggle "Need Accommodation" → Select Dorm or Suite → Select dates → Saves automatically

4. **At the bottom:** "Don't have a team yet?" → Click **"Register Now →"** to go to events page

---

## 9. Setting Up Jury & Evaluation (Jury Admin)

### Step 1: Go to Jury Dashboard

1. Log in → Click **"Dashboard"** in navbar
2. You land on the Jury Admin Dashboard

**What you see:**
- **4 stat boxes:** Questions, Jury Members, Submitted, Pending
- **Left card:** "Evaluation Questions" — Create scoring criteria
- **Right card:** "Jury Members" — Assign teams to jury members
- **Below:** "Evaluation Progress" — Monitor all submissions
- **Bottom:** "Team Rankings" — Leaderboard (appears after scores submitted)

### Step 2: Create Evaluation Questions

In the **left card** ("Evaluation Questions"):

1. Fill in these three fields:

| Field | What to Enter | Example |
|-------|--------------|---------|
| **Question Text** | What criterion to evaluate | `Innovation and Creativity` |
| **Max Score** | Maximum possible score | `10` |
| **Weight** | Importance percentage | `25` |

2. Click **"Add Question"**
3. The question appears in the list below
4. Repeat for all your criteria

**Recommended setup:**

| Question | Max Score | Weight |
|----------|----------|--------|
| Innovation & Creativity | 10 | 25 |
| Technical Implementation | 10 | 30 |
| Presentation & Communication | 10 | 15 |
| Impact & Usefulness | 10 | 20 |
| Team Coordination | 10 | 10 |
| **Total** | | **100** |

### Step 3: Assign Teams to Jury Members

> ⚠️ Teams must be **approved first** by the Registration Committee before you can assign them.

In the **right card** ("Jury Members"):

1. You see the list of jury members (added by Super Admin)
2. Click **"Assign Teams"** next to a jury member
3. A list of approved teams appears with checkboxes
4. **Check the teams** you want this person to evaluate
5. Click **"Save Assignments"**

**Tip:** Distribute teams evenly — 20 teams ÷ 4 jury members = 5 teams each.

---

## 10. QR Scanning & Logistics

### Who Does This: Logistics Committee

### Step 1: Open the Scanner

1. Log in → Click **"Dashboard"** in navbar
2. You land on the Logistics page

**What you see:**
- **4 stat boxes:** Total Coupons, Used (green border), Remaining, Usage %
- **4 meal cards** showing usage per type:
  - 🍽️ **Lunch** — e.g., "15 / 100" with progress bar
  - ☕ **Tea** — e.g., "8 / 100"
  - 🌙 **Dinner** — e.g., "0 / 100"
  - 🎁 **Kit** — e.g., "25 / 100"
- **QR Scanner card** titled "📱 QR Scanner" with subtitle "Scan or enter coupon code"
- **Recent Scans card** showing the last 20 scanned coupons

### Step 2: Scan a Coupon

**Method 1: Camera Scan**
1. In the "📱 QR Scanner" card, the camera opens automatically (if device has one)
2. Point camera at the team member's QR code
3. ✅ If valid → Green notification: *"Coupon marked as used"*
4. ❌ If already used → Red notification: *"Coupon already used"*

**Method 2: Manual Entry (if camera doesn't work)**
1. Below the camera area, there's a **text input field**
2. Type the coupon code manually
3. Click the **"Verify"** button (or press Enter)
4. System checks and shows result

### Step 3: Check Recent Scans

Below the scanner, the **"Recent Scans"** card shows the last 20 scans:
- **Member Name** (bold)
- **Coupon Code** (gray)
- **Type badge** (green badge: "lunch", "tea", "dinner", or "kit")
- **Time** when it was scanned

---

## 11. Food Management

### Who Does This: Food Committee / Logistics Committee

### Go to Food Dashboard

1. Log in → Click **"Dashboard"** → Navigate to `/{eventId}/food`

**What you see:**
- **Vegetarian count** (green number) and **Non-Vegetarian count** (red number)
- **Coupon statistics** with meal-type breakdown and progress bars

### Scanning Food Coupons

Same QR scanner as the Logistics page:

1. Team member shows their QR coupon (on phone or printed)
2. Scan with camera or type code manually
3. System checks three things:
   - ✅ Is this a valid coupon?
   - ✅ Is it the right meal time?
   - ✅ Has it already been used?
4. **Valid** → Green success → Let the person get food
5. **Invalid** → Red error explaining why (already used, wrong meal, expired, etc.)

---

## 12. Jury Evaluation (For Jury Members)

### Step 1: Go to Evaluation Page

1. Log in → Click **"Dashboard"** in navbar
2. You land on the evaluation page

**What you see:**
- List of **teams assigned to you** by the Jury Admin
- Each team shows: Team Code, Project Name, Status (Not Started / Draft / Submitted)

### Step 2: Evaluate a Team

1. Click on a team from your list
2. The evaluation form opens showing all questions

**For each question:**
- The question text is displayed (e.g., "Innovation and Creativity")
- A **score slider** or **number input** (0 to max score)
- Move the slider or type a score
- Optionally, add a comment about that specific criterion

**At the bottom of the form:**
- **Overall Comment** — Text area for general feedback about the team
- **"Save Draft"** button (gray) — Save progress, come back later, continue editing
- **"Submit Evaluation"** button (blue) — Final submission

### Step 3: Save or Submit

| Action | Button | What Happens |
|--------|--------|-------------|
| **Save Draft** | Gray button | Progress saved, status = "Draft", you can edit later |
| **Submit** | Blue button | Confirmation popup → Click OK → Status = "Submitted", cannot edit after |

⚠️ **Save drafts frequently** to avoid losing work!

After submitting, you return to your team list. The submitted team shows ✅ "Submitted". Click the next team to continue.

---

## 13. Announcements

### Who Does This: Any Committee Member

### Posting an Announcement

1. Go to `/{eventId}/announcements` (from Dashboard → Quick Access → 📢 Announcements card)
2. At the top, fill the form:
   - **Title** — Short headline (e.g., "Lunch is Ready!")
   - **Content** — Full message (e.g., "All teams proceed to Hall 2")
   - **Category** — Select from dropdown (General, Food, Logistics, etc.)
   - **Priority** — Normal or High
3. Click **"Post Announcement"**
4. It appears at the top of the announcement list

### Where People See Announcements

- **Volunteer page** (`/volunteer`) — Anyone can see without logging in
- **Announcements page** (`/{eventId}/announcements`) — Full list with filtering

---

## 14. Accommodation & Commute

### Accommodation (For Team Members)

In the **Team Portal** (`/team/[teamCode]`), each member can:

1. Toggle **"Need Accommodation"** to ON
2. Select **Room Type**: Dorm or Suite
3. Select **Dates**: Check boxes for needed nights (day before / event day / day after)
4. Changes save automatically → ✅ Green notification

### Accommodation Admin

Go to `/{eventId}/accommodation`:
- See all requests organized by date and room type
- Export the list for coordination with hostel/hotel

### Commute / Bus Schedules

**For Admins:**
- Go to `/{eventId}/commute`
- Add bus routes: route name, departure time, seats

**For Participants:**
- Go to `/volunteer` → See bus schedules with routes, times, and available seats

---

## 15. Exporting Data

### Who Does This: Committee Members / Super Admin

### Step 1: Go to Event Dashboard

1. Log in → Click **"Dashboard"** → Go to `/{eventId}/dashboard`
2. Scroll down past the stat boxes and Quick Access cards
3. Find the section titled **"Export Data"**

### Option 1: Export Everything (Recommended)

1. You see a **large blue button** at the top of the Export section:
   > **📦 Export All Data (ZIP)**
2. Below it: gray text saying "Download all event data in one ZIP file"
3. **Click the button**
4. A ZIP file downloads (named like `IGNITE2026_AllData_2026-03-15.zip`)
5. **Unzip the file** — Inside you find 6 Excel files:

| File | Contents |
|------|----------|
| `teams.xlsx` | All team details with every member |
| `food.xlsx` | Food preferences for all attending members |
| `coupons.xlsx` | All coupons with used/unused status |
| `accommodation.xlsx` | Accommodation requests |
| `evaluations.xlsx` | All jury scores and rankings |
| `attendance.xlsx` | Meal attendance records |

### Option 2: Export One at a Time

Below the ZIP button, you see gray text: **"Or export individually:"** followed by 6 smaller outlined buttons:

| Button Label | What Downloads |
|-------------|---------------|
| **Teams** | Team details + members |
| **Food Report** | Veg/non-veg counts |
| **Coupons** | All coupons + usage |
| **Accommodation** | Room assignments |
| **Evaluations** | Jury scores + rankings |
| **Attendance** | Meal scan logs |

Click any button → An Excel file (.xlsx) downloads.

---

## 16. Post-Event & Archiving

### Step 1: Lock All Evaluations (Jury Admin)

1. Go to `/{eventId}/jury` → Look at the **"Evaluation Progress"** card
2. For each submitted evaluation, you see action buttons:
   - **"Lock"** → Finalizes the score (cannot be changed after). Status turns green "Locked"
   - **"Send Back"** → Returns to jury member for revision. Status turns red "Sent Back"
3. Lock all evaluations before generating final results

### Step 2: View Final Rankings

1. On the same page, scroll to **"Team Rankings"** at the bottom
2. Teams shown ranked by score:
   - **#1** — Gold circle
   - **#2** — Silver circle
   - **#3** — Bronze circle
   - Each shows: team code, project name, average score, number of evaluations

### Step 3: Export All Data

Follow [Section 15: Exporting Data](#15-exporting-data)

### Step 4: Archive the Event (Super Admin)

1. Go to `/admin` → Click **"Manage Event →"** on your event
2. In "Event Settings" → Under "Event Status" → Click **"Archived"**
3. The event:
   - Moves to "Archived Events" on admin dashboard
   - Disappears from public events page
   - All data is preserved
   - Registration and evaluation automatically close

---

## 17. Troubleshooting & Common Scenarios

### ❌ "I can't see the Dashboard link in the navbar"

**Why:** You're not logged in, or you haven't been assigned a role.
**Fix:**
1. Click **"Staff Login"** (blue button, top-right) → Sign in with Google
2. If still no Dashboard → Ask the Super Admin to add your email at `/admin/events/[eventId]` → Committee Members section

### ❌ "Access Denied" or "Unauthorized" page

**Why:** You don't have the right role for that page.
**Fix:** Ask Super Admin to assign the correct role. For example:
- Teams page needs → "Registration Committee" role
- Jury page needs → "Jury Admin" or "Jury Member" role
- Logistics page needs → "Logistics Committee" role

### ❌ "Team not found" on Team Portal

**Why:** Wrong phone number or team code.
**Fix:**
- If using Phone: Enter the **team lead's** phone (not a member's)
- If using Code: Check for typos — codes look like `IGN26-XXXX` (uppercase)

### ❌ "I don't remember my team code"

**Fix:** Use the **📱 Phone Number** tab on Team Portal instead. Or ask the Registration Committee to look it up.

### ❌ QR Scanner camera not opening

**Fix:**
1. Browser may ask for camera permission → Click **"Allow"**
2. If no camera available → Use **Manual Entry**: type the coupon code in the text field and click "Verify"

### ❌ "Coupon already used"

**Why:** This coupon was scanned before (one coupon = one meal).
**Fix:** Check "Recent Scans" section to see when/who used it. Contact Super Admin if scanned by mistake.

### ❌ Jury member can't see assigned teams

**Fix (check both):**
1. **Jury Admin** must assign teams first: `/{eventId}/jury` → Jury Members card → Assign Teams
2. **Super Admin** must turn on evaluation: `/admin/events/{id}` → Toggle "Evaluation Open" to ON

### ❌ Evaluation won't save

**Fix:**
1. Make sure **every question has a score** (none can be blank)
2. Try **"Save Draft"** first
3. Check your internet connection

### 🔄 Late Team Registration

1. Super Admin: Toggle "Registration Open" back ON in event settings
2. Team registers at `/events` → picks the event → fills the form
3. OR Super Admin imports them via Excel at `/{eventId}/import`
4. Registration Committee approves immediately

### 🔄 Need to Change Team Member Details

1. Team members can update food preference and accommodation in Team Portal
2. For major changes: Registration Committee rejects the team, team re-registers with correct info, Committee re-approves

---

## 18. Complete Route Reference

### Public Pages (No Login Needed)

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page |
| Events List | `/events` | Browse active events, click to register |
| Registration Form | `/events/{eventId}/register` | Fill team registration (Google login required) |
| Team Portal Entry | `/team` | Enter phone/code to access team |
| Team Dashboard | `/team/{teamCode}` | View/edit team details |
| Volunteer Page | `/volunteer` | Announcements & bus schedules |

### Staff Pages (Login Required)

| Page | URL | Who Can Access | Purpose |
|------|-----|---------------|---------|
| Smart Dashboard | `/my-dashboard` | Anyone with a role | Auto-redirects to your role's page |
| Admin Dashboard | `/admin` | Super Admin | Create/manage events |
| User Management | `/admin/users` | Super Admin | View all users |
| Create Event | `/admin/events/new` | Super Admin | New event form |
| Manage Event | `/admin/events/{id}` | Super Admin | Settings + committee |
| Event Dashboard | `/{eventId}/dashboard` | Any committee member | Stats + quick access + export |
| Teams | `/{eventId}/teams` | Registration Committee | Approve/reject teams |
| Import Teams | `/{eventId}/import` | Registration / Admin | Excel bulk import |
| Jury Admin | `/{eventId}/jury` | Jury Admin | Questions + assignments + rankings |
| Jury Evaluate | `/{eventId}/jury/evaluate` | Jury Member | Score assigned teams |
| Food | `/{eventId}/food` | Food Committee | Food stats + preferences |
| Logistics | `/{eventId}/logistics` | Logistics Committee | QR scanner + attendance |
| Announcements | `/{eventId}/announcements` | Any committee member | Post event updates |
| Accommodation | `/{eventId}/accommodation` | Accommodation Admin | Room assignments |
| Commute | `/{eventId}/commute` | Commute Admin | Bus schedules |

---

## 19. Event Day Checklist

### 📅 2–3 Weeks Before

- [ ] Super Admin: Create event → Set to Active → Open Registration
- [ ] Super Admin: Add all committee members with their roles
- [ ] Share registration link with teams: `yoursite.com/events`

### 📅 1 Week Before

- [ ] Jury Admin: Create evaluation questions
- [ ] Registration Committee: Start reviewing and approving teams

### 📅 1 Day Before

- [ ] Registration Committee: Approve/reject all remaining teams
- [ ] Jury Admin: Assign teams to jury members
- [ ] Logistics: Test QR scanners on phones/tablets
- [ ] Super Admin: Turn ON "Evaluation Open" in event settings

### 📅 Event Day Morning

- [ ] Logistics: Open QR scanner at registration desk (`/{eventId}/logistics`)
- [ ] Food Committee: Ready at food counters with scanner open

### 📅 During Event

- [ ] Logistics: Scan attendance as teams arrive
- [ ] Food: Scan coupons at each meal
- [ ] Committee: Post announcements as needed
- [ ] Jury: Evaluate assigned teams

### 📅 After Event

- [ ] Jury Admin: Lock all evaluations
- [ ] Jury Admin: Review final rankings
- [ ] Super Admin: Click **📦 Export All Data** to download everything
- [ ] Super Admin: Archive the event

---

> **IGNITE V2** — Built for Darsana IGNITE event management 🔥
