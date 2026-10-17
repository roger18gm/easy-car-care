# EasyCarCare — Product Specification

## Overview

EasyCarCare is a consumer-focused vehicle maintenance web application designed for everyday drivers who are not automotive experts.

The app helps users understand what maintenance their car needs, when it needs it, and why it matters — without requiring technical knowledge.

Unlike traditional vehicle maintenance trackers that function as detailed logging systems or mechanic-oriented tools, EasyCarCare focuses on simplicity, guidance, automation, and reassurance.

The core product philosophy is:

> "Tell me what my car needs without me thinking."

EasyCarCare should feel approachable, calming, and helpful for users such as:
- Teen drivers
- Busy parents
- Office workers
- Elderly users
- First-time car owners
- People with little or no automotive knowledge

The product should reduce cognitive load and minimize decision making for users.

---

# Product Vision

EasyCarCare acts as a personal maintenance assistant for a user’s vehicle.

Instead of simply tracking maintenance records, the application proactively guides users by:
- Generating recommended maintenance schedules automatically
- Providing understandable recommendations
- Sending reminders before maintenance becomes urgent
- Explaining issues in plain English
- Helping users feel confident about vehicle ownership

The app should emphasize:
- Simplicity
- Clarity
- Guidance
- Trust
- Accessibility

The app should avoid:
- Complex automotive terminology
- Overwhelming dashboards
- Mechanic-focused workflows
- Enterprise-style interfaces
- Excessive manual data entry

---

# Target Audience

## Primary Audience

Everyday drivers who:
- Use their car mainly for commuting or errands
- Do not understand vehicle maintenance well
- Frequently forget maintenance schedules
- Feel stressed or uncertain about vehicle upkeep
- Want reminders and recommendations in simple language

## Secondary Audience

- Families managing multiple vehicles
- Parents monitoring teenage drivers’ vehicles
- Elderly users needing simplified guidance
- Budget-conscious drivers wanting to avoid costly repairs

---

# Product Goals

## Primary Goals

1. Simplify vehicle maintenance for non-technical users
2. Reduce forgotten maintenance events
3. Help users avoid costly long-term damage
4. Provide proactive maintenance guidance
5. Create a stress-free car ownership experience

## User Experience Goals

The application should:
- Require minimal setup
- Automate as much as possible
- Use plain English instead of technical jargon
- Feel reassuring rather than alarming
- Present only the most important information

---

# Core Product Philosophy

## Reduce User Decisions

Users should rarely need to:
- Research maintenance intervals
- Configure schedules manually
- Understand automotive terminology
- Decide what maintenance matters most

The system should intelligently guide the user instead.

---

# MVP Feature Set

## 1. Vehicle Onboarding

### Description
Users add a vehicle with minimal effort.

### Features
- VIN lookup/decoding
- Manual entry fallback
- Auto-fill:
  - Make
  - Model
  - Year
  - Engine (optional)
- Current mileage input
- Purchase date (optional)

### User Experience Requirements
- Onboarding should take less than 2 minutes
- Avoid asking unnecessary technical questions
- Use progress indicators
- Mobile-friendly forms

---

## 2. Automatic Maintenance Schedule Generation

### Description
The application automatically generates recommended maintenance tasks based on the vehicle.

### Example Tasks
- Oil changes
- Tire rotations
- Tire pressure checks
- Air filter replacement
- Brake inspections
- Battery checks
- Coolant inspections

### Requirements
- Schedule generation based on:
  - Vehicle make/model/year
  - Mileage
  - Time intervals
- Future extensibility for API-based manufacturer schedules

### User Experience Requirements
- Users should not manually create maintenance schedules
- Recommendations should feel personalized

---

## 3. Smart Dashboard

### Description
The home screen acts as the central “assistant” experience.

### Dashboard Components

#### Vehicle Health Score
Example:
- 92/100 — Excellent
- 75/100 — Needs Attention Soon

#### Upcoming Maintenance
Examples:
- “Oil change recommended in ~500 miles”
- “Tire rotation due next month”

#### Reassuring Status Messaging
Examples:
- “You’re all caught up 👍”
- “Your car is doing well”
- “Nothing urgent right now”

#### Alerts
Examples:
- “Battery may need inspection before winter”
- “Your tires should be checked soon”

### UX Requirements
- Simple, uncluttered layout
- Avoid technical language
- Prioritize readability on mobile devices

---

## 4. Maintenance Logging

### Description
Users can log completed maintenance quickly.

### Features
- One-tap maintenance completion
- Date tracking
- Mileage tracking
- Notes field (optional)
- Cost field (optional)

### Maintenance History Timeline
Examples:
- “Feb 10 — Oil Change Completed”
- “Mar 2 — Tires Rotated”

### UX Requirements
- Logging should take less than 30 seconds
- Timeline should feel easy to scan

---

## 5. Reminder System

### Description
Users receive reminders before maintenance becomes critical.

### Reminder Types
- Mileage-based reminders
- Time-based reminders
- Seasonal reminders

### Delivery Methods
- Email notifications
- Push notifications (future)
- In-app alerts

### Messaging Style
Use friendly and reassuring language.

Example:

Instead of:
> “Maintenance interval exceeded.”

Use:
> “Your car is still okay 👍 but it’s time to schedule an oil change soon.”

---

# Future Features

## Phase 2 Features

### OBD2 Integration
- Automatic mileage syncing
- Diagnostic data collection
- Dashboard warning code detection

### Dashboard Light Explanations
Examples:
- Check engine light explanations
- Severity guidance
- Suggested next steps

### AI Receipt Scanning
- Upload service receipts
- Extract:
  - Service type
  - Date
  - Mileage
  - Cost

### Recall Notifications
- NHTSA recall integration
- Safety alerts

### Mechanic Recommendations
- Nearby repair shops
- Trusted mechanic suggestions

### Cost Tracking
- Maintenance spending analytics
- Annual ownership cost estimates

### Multi-Vehicle Support
- Family vehicle management

---

# Application Structure

## Main Screens

### 1. Dashboard
Primary assistant interface.

Displays:
- Vehicle health score
- Upcoming maintenance
- Alerts
- Recommendations
- Recent activity

---

### 2. My Car
Displays:
- Vehicle details
- Mileage
- VIN
- Purchase date
- Maintenance schedule summary

---

### 3. Maintenance History
Displays:
- Chronological maintenance timeline
- Completed services
- Service notes
- Optional costs

---

### 4. Alerts & Recommendations
Displays:
- Upcoming services
- Seasonal recommendations
- Vehicle warnings
- Helpful maintenance tips

---

# User Experience Principles

## Simplicity First
Every feature should answer:

> “Would a non-technical user immediately understand this?”

If not:
- Simplify it
- Automate it
- Hide advanced options

---

## Plain English Communication

Avoid technical automotive terminology when possible.

### Example

Avoid:
- “Preventive maintenance overdue.”

Prefer:
- “Your car needs attention soon.”

---

## Reassuring Design

The application should reduce anxiety.

The tone should feel:
- Friendly
- Helpful
- Calm
- Encouraging

Not:
- Technical
- Corporate
- Alarmist

---

# Technical Architecture

## Frontend

### Framework
- Vue.js

### Recommended Technologies
- Vue Router
- Pinia (state management)
- Tailwind CSS
- Apollo Client

### Frontend Goals
- Mobile-first responsive design
- Fast interactions
- Minimal UI clutter
- Accessible interface

---

## Backend

### Framework
- Ruby on Rails

### API Style
- GraphQL API

### Recommended Technologies
- graphql-ruby
- PostgreSQL
- Sidekiq (background jobs)
- Redis
- Devise or Auth0 for authentication

### Backend Responsibilities
- Vehicle management
- Maintenance schedule generation
- Reminder scheduling
- Notification handling
- VIN data processing
- Recommendation engine

---

## Database

### Recommended Database
- PostgreSQL

### Core Entities

#### Users
- id
- name
- email
- authentication provider

#### Vehicles
- id
- user_id
- VIN
- make
- model
- year
- mileage
- purchase_date

#### MaintenanceTasks
- id
- vehicle_id
- task_type
- recommended_interval_miles
- recommended_interval_months
- next_due_mileage
- next_due_date

#### MaintenanceLogs
- id
- vehicle_id
- task_id
- completed_date
- completed_mileage
- notes
- cost

#### Notifications
- id
- user_id
- type
- message
- delivery_method
- sent_at

---

# GraphQL Design

## Example Queries

### Get Vehicle Dashboard
- vehicleDashboard(vehicleId)

### Get Maintenance History
- maintenanceHistory(vehicleId)

### Get Upcoming Recommendations
- upcomingMaintenance(vehicleId)

---

## Example Mutations

### Add Vehicle
- addVehicle

### Log Maintenance
- logMaintenance

### Update Mileage
- updateVehicleMileage

---

# Reminder Engine

## Responsibilities

The reminder engine determines:
- When maintenance is approaching
- Severity level
- Recommended urgency
- Notification timing

## Reminder Logic Examples

### Oil Change
Trigger when:
- Mileage threshold approaching
- Time interval approaching

### Tire Pressure
Trigger during:
- Seasonal temperature changes
- Long periods without inspection

---

# Design Direction

## Visual Inspiration
The app should visually resemble:
- Modern health apps
- Habit trackers
- Productivity apps

Rather than:
- Enterprise software
- Automotive repair systems

---

## UI Characteristics

### Emphasize
- Large readable typography
- Friendly icons
- Clear spacing
- Minimal screens
- Strong mobile usability

### Avoid
- Dense tables
- Complex forms
- Excessive charts
- Technical dashboards

---

# Potential Integrations

## VIN Decoding APIs
Possible providers:
- NHTSA VIN API
- Commercial VIN decoding services

## Future Integrations
- OBD2 Bluetooth devices
- Recall APIs
- Mapping/location services
- Mechanic directories

---

# Monetization Possibilities

## Future Monetization Options

### Freemium Model
Free:
- Basic reminders
- Single vehicle

Premium:
- Multiple vehicles
- Advanced diagnostics
- AI receipt scanning
- Priority notifications

### Partnerships
- Mechanics
- Insurance companies
- Automotive retailers

---

# Risks and Challenges

## Biggest Product Risks

### Overcomplication
Adding too many advanced features could alienate the target audience.

### Excessive Manual Input
Users may abandon onboarding if setup is too time consuming.

### Poor Reminder Quality
Too many notifications could feel annoying or stressful.

---

# Success Metrics

## User Experience Metrics
- Onboarding completion rate
- Weekly active users
- Maintenance logs created
- Reminder engagement rate
- Retention rate

## Product Success Indicators
- Users consistently returning to update mileage
- Positive feedback about simplicity
- Reduced forgotten maintenance events

---

# Elevator Pitch

> EasyCarCare helps everyday drivers understand and maintain their vehicles through simple reminders, smart recommendations, and stress-free guidance — without needing car knowledge.

---

# Homepage Messaging Ideas

## Headline Ideas

- “EasyCarCare keeps track of your car so you don’t have to.”
- “Car maintenance made simple.”
- “Know what your car needs without the stress.”
- “Maintenance reminders for normal people.”

## Supporting Messaging

- Friendly reminders
- Smart recommendations
- No car knowledge required
- Simple vehicle care guidance

---

# Final Product Philosophy

EasyCarCare should never feel like a maintenance spreadsheet.

It should feel like:
- a helpful assistant,
- a calm guide,
- and a trusted companion for vehicle ownership.

The user should feel:

> “Finally, someone is helping me take care of my car.”

