# Core Issue Tracking SaaS (Multi-Tenant)

## 📌 Project Overview

A lean, highly scalable, multi-tenant B2B SaaS platform designed to manage and resolve on-site issues (maintenance, repairs, cleaning). The core value proposition is simplicity for the end-user (reporting via QR code without app installations) and extreme flexibility for the clients (property managers, theme parks, zoos) through dynamic data models.

## 🚀 Core Philosophy

- **Single Source of Truth:** A single codebase and a single database for all tenants. NO forks, NO client-specific branches.
- **Data-Driven Customization:** Client-specific features (custom fields, UI colors, logos) are driven by database configurations (JSONB), not hardcoded logic.
- **Frictionless UX:** End-users report issues anonymously via a simple web form accessed via physical QR codes.

## 🛠 Tech Stack

- **Backend:** Python / Django (REST API)
- **Database:** PostgreSQL (Heavily utilizing JSONB for dynamic tenant data)
- **Frontend:** React (Web App / Admin Dashboard)
- **Notifications:** WhatsApp Business API / Twilio (Planned for worker dispatch)
