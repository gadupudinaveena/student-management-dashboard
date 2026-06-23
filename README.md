Project Overview
A secure, responsive single-page web management platform built for academic institutions to track student performance metrics and campus schedules simultaneously. The system authenticates users via a secure gateway, restricting view permissions until verified. Once a verified user accesses the portal, a dynamic analytics dashboard aggregates data metrics into real-time visual charts alongside operational data grids.

Technical Architecture & Core Libraries
The application uses a serverless implementation strategy, relying on structural libraries loaded directly via browser Content Delivery Networks (CDNs):

Data Visualization Engine (Chart.js): Generates client-side HTML5 canvas charts to render distribution bars and pie slices based on active database collections.

Scheduling Interface (FullCalendar API): Renders a responsive day-grid monthly calendar that dynamically parses data arrays into schedule events.

Backend Database & Gateway (Firebase SDK): Utilizes the web-compat layer to open up real-time stream links with authentication nodes and structural collections.

Database Management & Schema Structure
The platform manages document structures inside Cloud Firestore across two foundational collections:

1. The students Collection
Stores student profile records. Each independent document contains the following data types:

name (String): Student name forced into clean uppercase formatting.

branch (String): Academic engineering department identifier chosen via pre-defined selectors (CSE, ECE, EEE, MECH, CIVIL).

marks (Number): Performance score integer constrained within an evaluation scale of 0 to 100.

uid (String): An optional secure account mapping token that binds a specific record to an authenticated student login ID.

2. The events Collection
Maps incomingscheduling timelines to the calendar grid via structural parameters:

title (String): Event titles such as exam periods or campus workshops.

start (String): Standardized dates structured under the ISO date system (YYYY-MM-DD).

Key Features & Security Safeguards
Session Interceptor Firewall: The application's navigation panel stays completely hidden until an authorized session is established. If an unauthenticated user tries to force a view change, the security loop automatically kicks them back to the login gateway.

Auto-Sanitization Controls: Document input fields utilize reactive formatting listeners. E-mail strings are automatically normalized to lowercase to prevent credential duplication errors, while names are shifted to uppercase for table formatting consistency.

Localized Error Handling: Rather than outputting raw system errors when authentication fails, the input handler filters responses to block unauthorized access, alerting users cleanly if an e-mail is missing from the verified system roster.

Zero-State Resilience: The visualization engines are built with fallback limits. When database tables are freshly cleared, the canvas layers collapse cleanly into neutral layouts without causing execution breaks in the underlying script.
