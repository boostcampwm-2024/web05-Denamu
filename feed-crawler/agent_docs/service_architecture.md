## Component Diagram

```mermaid
graph TB
    Main["main.ts\n(Scheduler)"]

    subgraph Orchestration
        FC["FeedCrawler"]
    end

    subgraph Parser
        FPM["FeedParserManager"]
        RSS20["Rss20Parser"]
        ATOM10["Atom10Parser"]
        PU["ParserUtil"]
    end

    subgraph Workers
        CEW["ClaudeEventWorker"]
        FFCEW["FullFeedCrawlEventWorker"]
        AQW["AbstractQueueWorker\nbase"]
    end

    subgraph Repository
        FeedRepo["FeedRepository"]
        RssRepo["RssRepository"]
        TagMapRepo["TagMapRepository"]
    end

    subgraph Infrastructure
        MySQL[(MySQL)]
        Redis[(Redis)]
        Anthropic["Anthropic API"]
    end

    Main -->|"0,30 * * * *"| FC
    Main -->|"*/1 * * * *"| CEW
    Main -->|"*/5 * * * *"| FFCEW

    FC --> FPM
    FPM -->|format detect| RSS20
    FPM -->|format detect| ATOM10
    RSS20 --> PU
    ATOM10 --> PU

    FC --> FeedRepo
    FC --> RssRepo

    CEW -. extends .-> AQW
    FFCEW -. extends .-> AQW
    CEW --> TagMapRepo
    CEW --> FeedRepo
    CEW -->|API call| Anthropic

    FFCEW --> RssRepo
    FFCEW -->|trigger| FC

    FeedRepo -->|query| MySQL
    RssRepo -->|query| MySQL
    TagMapRepo -->|insert| MySQL

    FeedRepo -->|cache| Redis
    CEW -->|queue ops| Redis
    FFCEW -->|queue ops| Redis
```

## Module Responsibilities

| Module                     | Responsibility                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| main.ts                    | Register cron schedules, handle SIGINT/SIGTERM shutdown                                     |
| FeedCrawler                | Orchestrate crawling workflow, parallel RSS processing via `Promise.all`                    |
| FeedParserManager          | Auto-detect RSS/Atom format, delegate to parser via Strategy pattern                        |
| Rss20Parser / Atom10Parser | Extract and map XML fields per format                                                       |
| ParserUtil                 | Extract thumbnails from OG meta tags, normalize HTML entities, convert URLs to absolute     |
| ClaudeEventWorker          | Consume Redis AI queue, call `claude-3-5-haiku-latest`, save summaries/tags, manage retries |
| FullFeedCrawlEventWorker   | Receive RSS IDs from Redis queue → crawl all feeds for that RSS                             |
| Repository Layer           | Execute queries via mysql2 connection pool, ignore `ER_DUP_ENTRY` duplicate keys            |

## Scheduling

| Job           | Cron           | Description                                                   |
| ------------- | -------------- | ------------------------------------------------------------- |
| Feed Crawl    | `0,30 * * * *` | Crawl new feeds every 30 minutes                              |
| AI Processing | `*/1 * * * *`  | Process AI queue every 1 minute (respect AI_RATE_LIMIT_COUNT) |
| Full Crawl    | `*/5 * * * *`  | Process full crawl queue every 5 minutes                      |

## Data Flow

```mermaid
sequenceDiagram
    participant Sched as Scheduler
    participant FC as FeedCrawler
    participant Parser as Parser
    participant Repo as Repository
    participant Redis as Redis
    participant CEW as ClaudeEventWorker
    participant AI as Anthropic
    participant DB as MySQL

    Sched->>FC: start(startTime)
    FC->>Repo: selectAllRss()
    Repo->>DB: SELECT * FROM rss_accept

    par Parallel RSS Fetch
        FC->>Parser: fetchAndParse(rss1, startTime)
        FC->>Parser: fetchAndParse(rss2, startTime)
    end

    Parser-->>FC: FeedDetail[]
    FC->>Repo: insertFeeds()
    Repo->>DB: INSERT INTO feed
    FC->>Redis: rpush feed:ai:queue
    FC->>Redis: hset feed:recent:*

    Sched->>CEW: start()
    CEW->>Redis: rpop feed:ai:queue
    CEW->>AI: messages.create

    alt Success
        CEW->>DB: UPDATE feed SET summary
        CEW->>DB: INSERT INTO tag_map
        CEW->>Redis: hset feed:recent:* tag
    else Retryable & deathCount < 3
        CEW->>Redis: rpush feed:ai:queue
    else deathCount >= 3
        CEW->>DB: UPDATE feed SET summary = NULL
    end
```

## Redis Key Schema

| Key Pattern             | Type | Purpose                                                                                     |
| ----------------------- | ---- | ------------------------------------------------------------------------------------------- |
| `feed:ai:queue`         | List | AI processing queue. rpush for enqueue, rpop for consumption. Retry uses lpush for priority |
| `feed:full-crawl:queue` | List | Full crawl request queue                                                                    |
| `feed:recent:{id}`      | Hash | Recent feed cache (title, thumbnail, tags, viewCount)                                       |

## Retry Policy

| Condition                              | Action                       |
| -------------------------------------- | ---------------------------- |
| Rate limit (429), timeout, 503         | Requeue with `deathCount++`  |
| 401, invalid request, JSON parse error | Discard — set summary = NULL |
| `deathCount >= 3`                      | Discard — set summary = NULL |

## Dependency Injection

- Based on `tsyringe`.
- All Infrastructure, Repository, Service, and Worker modules are registered as **Singletons** using Symbol bindings.
