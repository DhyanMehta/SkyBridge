# SkyBridge — Product Requirements Document
Team: <Your Team Name> | 22North Product Engineering Challenge 2026

## 1. Problem Statement
SkyJet Airways (65 aircraft, Asia) sees 40% of passengers call the contact
center during weather disruptions to ask 3 questions: Is my flight cancelled?
Can I move to another flight? Am I refund-eligible? Average wait: 25 min.

## 2. Goal
Resolve these 3 questions end-to-end via self-service in under 2 minutes,
with clear escalation to a human agent for anything outside deterministic
rules.

## 3. Users
Primary: SkyJet passenger with a disrupted flight, on web/mobile browser.
Secondary (not built, noted as future work): SkyJet contact-center agent
dashboard to see auto-resolved cases.

## 4. Scope (In / Out)

### In scope
- PNR + last name lookup
- Disruption classification (cancelled / delayed >3h / delayed <3h / on-time)
- Rebooking (select from ≤3 alternate flights, instant confirmation)
- Refund eligibility check + refund request submission (no payment execution)
- Agent escalation CTA on every screen
- Auto-generated natural-language disruption summary (AI-assisted)

### Out of scope (documented, not silently dropped)
- Payment processing
- WhatsApp/SMS channels
- Multi-passenger / group PNRs
- Special assistance, baggage, seat changes
- Authentication beyond PNR+name (no OTP/login system)

## 5. User Journey
1. Passenger lands on SkyBridge → enters PNR + last name
2. System fetches flight + passenger record (mocked API)
3. System classifies disruption → shows status banner + AI-generated summary
4. System presents ONLY the relevant action(s) for that disruption type
5. Passenger completes action (rebook / request refund / acknowledge delay)
6. Confirmation screen with reference number + "what happens next"
7. Escalation option always visible if passenger wants a human

## 6. Functional Requirements
- FR1: Lookup passenger/flight via PNR + last name (mocked API, <500ms)
- FR2: Classify disruption using flight status field via rule table
- FR3: Return valid action set based on disruption type (business rules
       documented in solution doc)
- FR4: Rebooking — query alternate flights (mocked, same route ±48h),
       confirm selection, generate new PNR
- FR5: Refund eligibility — rule-based decision (airline-caused vs.
       passenger-caused disruption), submit refund request record
- FR6: Every screen has persistent "Talk to an agent" link
- FR7: AI-generated plain-language summary of disruption + eligible
       actions (Groq call, cosmetic layer over FR2 output)

## 7. Non-Functional Requirements
- Response time: sub-second for all mocked API calls
- Explainability: every automated decision traceable to a rule, loggable
- Scalability (design-level, not implemented): stateless FastAPI services,
  horizontally scalable; disruption rules externalized to config, not
  hardcoded, so new rules can be added without redeploy

## 8. Architecture (for your diagram)
React SPA → FastAPI (REST) → Rule Engine module → Mock Data Layer (JSON)
                              → Groq API (summary generation only)

## 9. Key Assumptions
- Flight/passenger data would come from SkyJet's PSS (Passenger Service
  System) in production; mocked here as static JSON per brief constraint
- Refund "eligibility" rules approximate real airline policy (weather/ATC
  disruption = 100% eligible; voluntary change = not eligible) — real
  rules would be legal/policy-team defined
- No payment gateway integration per brief constraint; refund requests are
  queued for backend processing
- Single passenger per PNR for MVP scope

## 10. Future Enhancements (say this on your last slide)
- Agent-assist dashboard showing auto-resolved vs. escalated cases
- WhatsApp/SMS proactive disruption notifications (ties to Challenge 2)
- NLP-based free-text intent capture before falling back to guided UI
- Real PSS/GDS integration
- Compensation calculation per DGCA/regional passenger rights rules