# Backend Project Instructions

## Tech Stack

- Node.js + TypeScript
- Express.js for HTTP server
- PostgreSQL database
- Prisma ORM
- RESTful API architecture

## Architecture

- **Flow**: Routes → Controllers → Services → Prisma
- No business logic in controllers
- Controllers handle HTTP concerns only (request/response)
- Services contain all business logic
- Services must be pure and testable
- One service per domain entity
- Keep database queries in services, not controllers

## Coding Principles

- Keep things simple, no overengineering
- Explicit code over magic and abstractions
- One responsibility per file
- Prefer clarity over cleverness
- No premature optimization
- Avoid unnecessary dependencies
- Write code that's easy to understand and modify

## Error Handling

- Services throw typed errors (custom error classes)
- Controllers catch errors and map them to HTTP responses
- Use appropriate HTTP status codes
- Return consistent error response format
- Never expose internal errors to clients

## Project Goal

- Build an MVP backend for a tipster platform
- Focus on clean REST API design
- Prioritize maintainability over features
- Learning-first approach
- Start simple, iterate based on real needs

## General Rules

- Always plan before coding
- Ask questions when requirements are unclear
- Test critical business logic
- Keep functions small and focused
- Use TypeScript strictly (no `any` types)
