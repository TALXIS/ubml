# UBML Schema Reference

Complete reference documentation for all UBML schema types and properties.

## Table of Contents

- [Document Types](#document-types)
- [Element Reference](#element-reference)
- [Common Types](#common-types)
- [Expression Language](#expression-language)

## Document Types

### Workspace (`*.workspace.ubml.yaml`)

Root configuration for a UBML project.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ubml` | string | ✅ | Version identifier, must be "1.0" |
| `name` | string | ✅ | Workspace name |
| `description` | string | | Detailed description |
| `version` | string | | Semantic version (e.g., "1.0.0") |
| `status` | enum | | `draft`, `review`, `approved`, `archived` |
| `organization` | object | | Organization metadata |
| `scope` | object | | Project scope definition |
| `settings` | object | | Global configuration |

### Process (`*.process.ubml.yaml`)

Process workflow definitions.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ubml` | string | ✅ | Version identifier |
| `processes` | object | | Map of process definitions (PR###) |

#### Process Definition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Process name |
| `description` | string | | Detailed description |
| `level` | integer | | Process level (1-4) |
| `owner` | ActorRef | | Process owner |
| `steps` | object | | Map of step definitions (ST###) |
| `links` | object | | Map of link definitions |
| `phases` | object | | Map of phase definitions (PH###) |

### Actors (`*.actors.ubml.yaml`)

Organizational roles and resources.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ubml` | string | ✅ | Version identifier |
| `actors` | object | | Map of actor definitions (AC###) |
| `skills` | object | | Map of skill definitions (SK###) |
| `resourcePools` | object | | Map of resource pool definitions (RP###) |

### Entities (`*.entities.ubml.yaml`)

Information model definitions.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ubml` | string | ✅ | Version identifier |
| `entities` | object | | Map of entity definitions (EN###) |
| `documents` | object | | Map of document definitions (DC###) |
| `locations` | object | | Map of location definitions (LO###) |

### Hypotheses (`*.hypotheses.ubml.yaml`)

SCQH problem framing.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ubml` | string | ✅ | Version identifier |
| `hypothesisTrees` | object | | Map of hypothesis tree definitions (HT###) |
| `evidence` | object | | Map of evidence items (EV###) |

## Element Reference

### Step Kinds

| Kind | Description |
|------|-------------|
| `action` | Work activity or task |
| `decision` | Decision or gateway point |
| `wait` | Waiting for external event |
| `notification` | Send notification |
| `subprocess` | Call to sub-process |

### Gateway Types

| Type | Description |
|------|-------------|
| `exclusive` | XOR - one path taken |
| `parallel` | AND - all paths taken |
| `inclusive` | OR - one or more paths |
| `event` | Event-based decision |

### Block Operators

| Operator | Description |
|----------|-------------|
| `par` | Parallel execution |
| `alt` | Alternative paths |
| `loop` | Iteration |
| `opt` | Optional execution |

### Actor Kinds

| Kind | Description |
|------|-------------|
| `role` | Internal role or position |
| `team` | Group of people |
| `system` | Automated system |
| `external` | External party |

### Hypothesis Types

| Type | Description |
|------|-------------|
| `root` | Top-level hypothesis |
| `supporting` | Evidence-based sub-hypothesis |
| `assumption` | Working assumption |

## Common Types

### Duration

Format: `<number><unit>`

| Unit | Description |
|------|-------------|
| `min` | Minutes |
| `h` | Hours |
| `d` | Days |
| `wk` | Weeks |
| `mo` | Months |

Examples: `30min`, `2h`, `1.5d`, `2wk`

### Money

Format: `<currency><amount>` or `<amount>`

Examples: `$100`, `€50.00`, `100 USD`

### References

All references follow the pattern `<PREFIX><3+ digits>`:

| Prefix | Type |
|--------|------|
| `AC` | Actor |
| `PR` | Process |
| `ST` | Step |
| `EN` | Entity |
| `DC` | Document |
| etc. | See ID Patterns table |

## Expression Language

UBML supports a safe expression language for conditions and calculations.

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equals | `status == "approved"` |
| `!=` | Not equals | `status != "rejected"` |
| `>`, `<`, `>=`, `<=` | Comparison | `amount > 1000` |
| `&&` | And | `valid && complete` |
| `\|\|` | Or | `urgent \|\| priority == "high"` |
| `!` | Not | `!processed` |

### Functions

| Function | Description | Example |
|----------|-------------|---------|
| `count()` | Count items | `count(items) > 0` |
| `sum()` | Sum values | `sum(amounts)` |
| `min()`, `max()` | Min/max value | `max(scores)` |
| `avg()` | Average | `avg(durations)` |

### Context Variables

Expressions can access:
- Step outputs
- Entity attributes
- Case attributes
- Process variables
