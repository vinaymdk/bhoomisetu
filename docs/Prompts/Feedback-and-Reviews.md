Title: Module 11 – Reviews & Feedback (Backend Completion Summary)

Module: Reviews & Feedback  
Status: COMPLETE (Backend) + IN PROGRESS (Frontend)

Overview:
Module 11 delivers a robust, AI-powered Reviews & Feedback system with verified-only reviews, sentiment analysis, fake review detection, moderation workflows, and deep integration with core platform modules.

Key Features:
- Rating and review submission allowed only after verified viewing or deal completion
- Verified purchases enforced via interest expressions and chat sessions
- AI-based sentiment analysis for all reviews:
  - Positive
  - Negative
  - Neutral
  - Mixed
- AI-powered fake review detection using multiple behavioral and content signals
- Review moderation workflow:
  - Auto-approval for safe reviews
  - Manual moderation for AI-flagged reviews
- Helpful votes functionality to surface high-quality reviews
- Review reporting for inappropriate or abusive content
- Seller and Agent replies to reviews with moderation support
- Anonymous review submission support with privacy protection

Backend Implementation:
- Comprehensive Reviews API:
  - Create, update, list, report, reply, and vote
- Automatic AI sentiment analysis for every submitted review
- Automatic AI fake review detection for every submitted review
- Verified purchase validation through mediation and chat data
- Moderation logic driven by AI confidence scores
- Privacy enforcement and role-based access control

Frontend Implementation (Web + Mobile):
- Reviews list and create flows (property + seller scope)
- Property details review section with deep link to reviews
- Helpful vote and report support
- Seller/agent reply entry point
- Review models + services added on both clients

Database Schema:
- reviews:
  - Core review data
  - AI sentiment result
  - Fake review risk score
  - Moderation status
- review_helpful_votes:
  - Tracks helpful votes per user
- review_reports:
  - Stores user-reported issues on reviews
- review_replies:
  - Seller/Agent replies linked to reviews

Module Integrations:
- Properties Module:
  - Reviews linked to properties
  - Only LIVE properties can receive reviews
- Mediation Module:
  - Verified reviews tied to interest expressions and chat sessions
- Users Module:
  - Reviews linked to reviewer and reviewee
  - Anonymous reviewer support
- Notifications Module:
  - Reviewee notified on new reviews
  - Reviewer notified on replies
- AI Service:
  - Sentiment analysis for all reviews
  - Fake review detection and risk scoring

Outcome:
This module ensures trustworthy, moderated, and AI-validated feedback, improving platform credibility and decision-making for buyers, sellers, and agents.

Runbook:
- Run migrations (Module 11 schema already present in `db/migrations/20260109_reviews_feedback_schema.sql`)
- Optional sample data: `./scripts/load_module11_sample_data.sh` (or run SQL in `db/sample-data/module11_reviews_sample_data.sql`)
- Web smoke check: open `/properties/:id` and `/reviews`, create a review as buyer
- Mobile smoke check: open Property Details → Reviews → Create Review
