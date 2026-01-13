# Scratchpad

Working memory for the tipster platform backend.

---

## Project Context

Building a SaaS platform where sports tipsters can publish tips and subscribers can follow them.

Learning-first project: focus on understanding patterns, not shipping features.

---

## MVP Scope

Three core entities:

1. **Tips** - predictions published by tipsters
2. **Tipsters** - users who publish tips
3. **Subscriptions** - relationships between subscribers and tipsters

---

## First Vertical Slice

**Goal**: Tipster publishes a tip

End-to-end flow:
- POST /api/tips (create a tip)
- GET /api/tips (list tips)
- GET /api/tips/:id (get single tip)

This proves out:
- Express setup
- Prisma connection
- Routes → Controllers → Services pattern
- Error handling
- TypeScript config

---

## Current Status

**Backend bootstrap**: Not started yet

Need to set up:
- [ ] Project structure
- [ ] TypeScript config
- [ ] Express server
- [ ] Prisma setup
- [ ] Database schema
- [ ] First endpoint

---

## Open Questions / Postponed

- **Odds validation**: Skip for now, assume client sends valid data
- **Authentication**: Postponed, assume all requests are authenticated tipsters
- **Pagination**: Postponed, return all results for MVP
- **Authorization**: Postponed, no permissions checks yet
- **Input validation**: Basic only, no complex validation rules

---

## Notes

(Add notes here as we work)

