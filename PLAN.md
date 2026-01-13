# Technical Plan

This document describes the high-level technical structure of the project.

---

## Architecture Overview

- Monolithic application
- Backend-driven
- Single codebase
- Clear separation of concerns

The architecture prioritizes:
- Readability
- Explicit logic
- Ease of learning

---

## Main Domains

### User
- Authentication
- Roles (regular user, tipster)

### Tipster
- Public profile
- Association with a user account

### Tip
- Content (prediction, explanation)
- Metadata (event, odds, date)

### Subscription
- Relationship between users and tipsters
- Free subscriptions in MVP

---

## Key Decisions

- No microservices
- No event-driven architecture
- No CQRS or DDD-heavy patterns
- Use simple CRUD flows first

---

## Risks & Trade-offs

- Simplicity may limit flexibility later
- Some refactors will be needed as features grow
- Acceptable for a learning-first MVP
