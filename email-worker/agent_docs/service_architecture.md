## Component Diagram

```mermaid
graph LR
    subgraph RabbitMQ
        SendQ["email.send.queue"]
        Wait5["email.send.wait.5s"]
        Wait10["email.send.wait.10s"]
        Wait20["email.send.wait.20s"]
        DLQ["email.deadLetter.queue"]
    end

    subgraph EmailWorker
        RMQMgr["RabbitMQManager\nConnection"]
        RMQSvc["RabbitMQService\nChannel Ops"]
        Consumer["EmailConsumer\nDispatch & Error"]
        EmailSvc["EmailService\nSMTP Send"]
        Content["email.content\nTemplates"]
    end

    SMTP["SMTP Server"]

    SendQ -->|consume| RMQSvc
    RMQSvc -->|onMessage| Consumer
    Consumer -->|dispatch by type| EmailSvc
    EmailSvc --> Content
    EmailSvc -->|send| SMTP

    Consumer -->|transient, retry=0| Wait5
    Consumer -->|transient, retry=1| Wait10
    Consumer -->|transient, retry=2| Wait20
    Consumer -->|permanent or retry>=3| DLQ

    Wait5 -->|TTL expire| SendQ
    Wait10 -->|TTL expire| SendQ
    Wait20 -->|TTL expire| SendQ

    RMQMgr --> RMQSvc
```

## Module Responsibilities

| Module          | Responsibility                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| EmailConsumer   | Consume queue messages, dispatch by type, classify errors, retry or route to DLQ, handle graceful shutdown |
| EmailService    | Send emails via Nodemailer/SMTP, provide methods per email type                                            |
| email.content   | Generate HTML templates for each email type                                                                |
| RabbitMQService | Publish/consume messages via AMQP channels, handle ack/nack                                                |
| RabbitMQManager | Manage AMQP connections and channel creation                                                               |

## Email Types

| Type               | Trigger                | Description                              |
| ------------------ | ---------------------- | ---------------------------------------- |
| USER_CERTIFICATION | User registration      | Send email verification code             |
| RSS_REGISTRATION   | RSS approval/rejection | Send approval result or rejection reason |
| RSS_REMOVAL        | RSS removal request    | Send deletion confirmation code          |
| PASSWORD_RESET     | Password reset         | Send reset code                          |
| ACCOUNT_DELETION   | Account deletion       | Send deletion confirmation code          |

## Queue Topology

```mermaid
graph LR
    EmailExchange["EmailExchange\n(Direct)"]
    EmailExchange -->|"email.send"| SendQ["email.send.queue"]

    SendQ -->|fail, retry < 3| WaitQueues
    subgraph WaitQueues
        W5["email.send.wait.5s\nTTL: 5000ms"]
        W10["email.send.wait.10s\nTTL: 10000ms"]
        W20["email.send.wait.20s\nTTL: 20000ms"]
    end

    WaitQueues -->|"TTL expires → x-dead-letter-exchange"| SendQ
    SendQ -->|permanent or retry >= 3| DLQ["email.deadLetter.queue"]
```

## Error Classification

| Category             | Errors                                                 | Action                       |
| -------------------- | ------------------------------------------------------ | ---------------------------- |
| Transient (Network)  | ECONNREFUSED, ETIMEDOUT, ESOCKETNOTFOUND, Socket close | Retry via Wait Queue (max 3) |
| Transient (SMTP 4xx) | 421, 450, 451, 452                                     | Retry via Wait Queue (max 3) |
| Permanent (SMTP 5xx) | 550, 552, 553, 554                                     | Immediate DLQ                |
| Unknown              | Unclassified                                           | Immediate DLQ                |
| Max Retry            | retryCount >= 3                                        | DLQ (MAX_RETRIES_EXCEEDED)   |

## DLQ Header Schema

All DLQ messages include debugging headers:

| Header          | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| x-retry-count   | Number of retries                                             |
| x-error-code    | SMTP / Node error code                                        |
| x-error-message | Error message                                                 |
| x-failed-at     | Failure timestamp (ISO 8601)                                  |
| x-failure-type  | SMTP_PERMANENT_FAILURE / MAX_RETRIES_EXCEEDED / UNKNOWN_ERROR |
| x-response-code | SMTP response code (optional)                                 |
| x-error-stack   | Stack trace (optional)                                        |

## Graceful Shutdown

1. Receive SIGINT/SIGTERM
2. `stopConsuming()` — Stop receiving new messages
3. `waitForPendingTasks()` — Wait for in-progress tasks to complete
4. `close()` — Clean up consumers and connections
