# Telugu Thodu (తెలుగు తోడు)

> ## AI Voice Companion Infrastructure for Telugu Families
>
> Telugu Thodu is an AI voice companion that calls Telugu parents living alone, understands how they are doing through natural conversations, and helps NRIs stay emotionally connected with their families back home.

---

## 📌 Project Overview

**Telugu Thodu** (meaning *Telugu Companion*) is a proactive, voice-first wellness infrastructure designed for Telugu families separated by distance.

Instead of relying on manual check-ins or smartphone apps that elderly parents may find difficult to use, Telugu Thodu initiates automated voice calls directly to traditional Indian telecom lines and speaks naturally in Telugu/Tenglish.

The system understands conversational speech, extracts wellness signals like emotional stress or medication adherence, and delivers structured updates to children living abroad through a real-time dashboard.

---

## 👩‍💼 Real-World Example: Explaining Telugu Thodu to Telugu NRI Sudha living in Texas, USA

> “Sudha, you're in Texas working long hours, dealing with time zones, and always worrying if your mom back in Hyderabad is genuinely okay.
>
> When you call her, she does what all Indian moms do — she hides her pain, says *‘Antha baane undi ra’* (Everything is fine), and hangs up because she doesn't want to stress you out.
>
> Telugu Thodu is an automated, friendly AI companion that calls your mom directly on her regular phone line at a scheduled time.
>
> It speaks to her in a warm, comforting, local Telugu accent. It asks how her day is going, if she took her blood pressure medicines, or if she has any pain.
>
> Your mom doesn't need a smartphone, an internet connection, or a tech degree.
>
> She just answers the phone and chats naturally, mixing Telugu and English like she normally does.
>
> The moment she hangs up, our AI listens to what she said, catches if she is secretly feeling weak or dizzy, and updates a clean dashboard for you.
>
> Instead of worrying or guessing, you look at your phone in Texas and instantly see a message:
>
> *‘Amma took her medicine but mentioned slight morning dizziness. She sounds a bit anxious today — consider giving her a call tonight.’*
>
> It gives you absolute peace of mind while keeping her safe without any tech hassle.”

---

## 💭 The Problem

For many Telugu NRIs living in the US or Europe, one silent anxiety never goes away:

> “Are my parents actually okay?”

Parents often say:
- “Everything is fine.”
- “Don’t worry about us.”
- “We’re managing.”

Even when:
- medicines are skipped,
- stress is increasing,
- health issues are developing,
- or loneliness is becoming severe.

At the same time:
- time zones,
- work schedules,
- and physical distance
make daily monitoring difficult.

Telugu Thodu acts as an empathetic AI companion that bridges this emotional and informational gap.

---

## 👵 Parent Experience — How Telugu Thodu Helps

The parent receives a simple phone call.

No app installation.  
No typing.  
No smartphone knowledge required.

Just a natural conversation like:

> “Namaste amma, medicines teesukunnara today?”  
> “Ela unnaru?”  
> “Tindi time ki tinnara?”  
> “BP or sugar issue emaina unda?”

The parent simply speaks normally in Telugu or Tenglish.

---

## 🧠 Cognitive Processing Pipeline

The AI system analyzes conversations for:

- emotional tone,
- stress indicators,
- loneliness signals,
- health complaints,
- medicine adherence,
- conversational irregularities,
- urgency detection.

### Example

If a parent says:

> “Konchem dizziness undi… medicines miss ayyayi.”

The system may infer:
- possible health discomfort,
- skipped medication,
- follow-up recommendation.

---

## 📱 NRI Dashboard Experience

Instead of forcing children abroad to listen to lengthy call recordings, Telugu Thodu compresses raw conversational data into structured wellness summaries.

| Analytical Matrix | Extracted Value |
| --- | --- |
| **Mood Index** | ⚠️ Slightly Anxious |
| **Medication Adherence** | ❌ Skipped |
| **Reported Issues** | `["Dizziness", "Weakness"]` |
| **Action Required** | **TRUE** |
| **AI Summary** | *"Mother sounded weak and mentioned dizziness after skipping blood pressure medication."* |

Within seconds, NRIs can understand how their parents are doing emotionally and physically.

---

# 🛠️ Tech Stack & Engineering Rationale

| Architecture Layer | Technology | Engineering Selection Reason |
| --- | --- | --- |
| **Framework & Router** | **Next.js 15 (App Router)** | Full-stack TypeScript architecture enabling asynchronous serverless webhook execution and modern streaming UI rendering. |
| **Data Integrity Layer** | **Zod Validation** | Enforces strict runtime parsing and schema safety across unpredictable AI-generated outputs. |
| **Telephony Middleware** | **Twilio Programmable Voice** | Handles telecom edge delivery, TwiML execution maps, recording buffers, and asynchronous call orchestration. |
| **Sovereign Speech AI** | **Sarvam AI (Saaras & Bulbul)** | Configured explicitly for `mode: "codemix"` and `language_code: "te-IN"` to process real-world Telugu-English conversational audio. |
| **Inference Engine** | **Gemini 2.5 Flash** | Used for rapid structured semantic analysis and deterministic object generation. |
| **State Cache Layer** | **Upstash Redis** | Maintains transient telephony lifecycle states (`CALL_TRIGGERED`, `IN_PROGRESS`, `ANALYZING`) with ultra-low latency. |
| **UI Presentation Layer** | **shadcn/ui + Tailwind CSS** | Utility-first responsive interface for clean dashboard rendering. |

---

# 🔄 End-to-End Telephony Lifecycle

The system decouples unstable telecom behavior from internal processing logic using an asynchronous event-driven architecture.

```txt
[Parent Mobile Device / Telecom Carrier]
                    │
                    ▼ (8kHz Telephony Audio)
     [Twilio Voice Infrastructure]
                    │
                    ▼ (Encrypted Webhook Tunnel)
     [Next.js Serverless Processing Layer]
                    │
                    ├─► [Sarvam Saaras API]
                    │         └─► Telugu/Tenglish Speech Extraction
                    │
                    ├─► [Gemini 2.5 Flash]
                    │         └─► Semantic Analysis + Structured Evaluation
                    │
                    ▼
        [Zod Runtime Validation Layer]
                    │
                    ▼
        [Upstash Redis State Cache]
                    │
                    ▼
    [Real-Time Wellness Dashboard]
                    │
                    ▼
     [Weekly Scheduler / Digest Engine]
                    │
                    ▼
[WhatsApp API (NRI Child Abroad)]
                    └─► Weekly Wellness Summary Report
```

---

## 📋 Telephony State Machine

| Lifecycle State | Trigger Vector | System Action | Output |
| --- | --- | --- | --- |
| **`CALL_TRIGGERED`** | Cron / Manual Trigger | Initialize Twilio session & allocate Redis tracking key | `callSid`, `status` |
| **`IVR_STREAMING`** | Parent Answers | Dispatch Telugu greeting & initialize recording flow | TwiML XML |
| **`STT_PROCESSING`** | Call Ends | Stream `.wav` buffer to Sarvam AI | Raw Tenglish Transcript |
| **`COGNITIVE_ANALYSIS`** | Transcript Ready | Execute semantic wellness analysis | Structured JSON |
| **`STATE_RESOLVED`** | Validation Success | Persist validated object & refresh dashboard | `WellnessReport` |
| **`WEEKLY_DIGEST_DISPATCHED`** | Weekly Scheduler Trigger | Generate longitudinal wellness summary & deliver update to NRI child via WhatsApp | WhatsApp Wellness Digest |

---

# 🧑‍💻 Type-Safe AI Contracts

The system never trusts raw LLM output directly.

Every AI-generated response is forced through deterministic runtime validation before touching application state or UI rendering.

```typescript
import { z } from 'zod';

export const WellnessReportSchema = z.object({
  overallMood: z.enum([
    'positive',
    'neutral',
    'anxious',
    'depressed',
  ]),
  reportedHealthIssues: z.array(z.string()),
  medicationStatus: z.enum([
    'taken',
    'skipped',
    'unknown',
  ]),
  actionRequired: z.boolean(),
  summaryForChild: z.string().min(10).max(250),
});

export type WellnessReport =
  z.infer<typeof WellnessReportSchema>;
```

---

# 🚀 Future Scaling Directions

The current implementation acts as a high-fidelity infrastructure prototype with clean abstraction boundaries for future production scaling.

## Planned Evolution Paths

### 1. Bidirectional Conversational Streaming

Replace static Twilio `<Record>` flows with Twilio Media Streams over WebSockets for real-time conversational turn-taking.

### 2. Distributed Queue Processing

Move transcription and semantic analysis into dedicated worker queues using NestJS + BullMQ.

### 3. Resilient Failure Recovery

Implement fallback audio injection systems during transient external API outages.

### 4. Longitudinal Wellness Tracking

Detect gradual emotional or behavioral decline over time using historical conversational memory.

---

# 🌏 Why This Project Exists

Telugu Thodu is not trying to replace family relationships.

It exists to strengthen them.

The goal is simple:

> Use localized AI voice infrastructure to help Telugu families stay emotionally connected across continents.

---