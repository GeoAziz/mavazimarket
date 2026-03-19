# 🔧 Production Roadmap Implementation Guide

**How to use the PRODUCTION_ROADMAP.md file and create actionable GitHub issues**

---

## Quick Start

### 1. View the Roadmap
```bash
cat PRODUCTION_ROADMAP.md
```

The file is structured with:
- **Tier 1:** 7 blocking issues (must fix before ANY production deploy)
- **Tier 2:** 5 high-priority items (before launch week)
- **Tier 3:** 4 medium-priority items (week 2-3 of production prep)
- **Tier 4:** 4 post-launch nice-to-haves

### 2. Create GitHub Issues from the Roadmap

#### Option A: Manual Creation (Recommended for first time)

For each Tier-1 issue:

1. Go to GitHub → Your repo → **Issues** → **New Issue**
2. Title: Copy from roadmap (e.g., "1.1: Re-enable TypeScript/ESLint Build Failures")
3. Description:
   ```markdown
   ## Problem
   [Copy from "Current Risk" section]
   
   ## Impact
   [Copy from "Impact" section]
   
   ## Files Affected
   [List all files with line numbers]
   
   ## Changes Required
   [Copy steps from "Changes Required" section]
   
   ## Acceptance Criteria
   - [ ] [Each criterion as checkbox]
   
   ## Estimated Effort
   [Time estimate]
   
   ## Related Issues
   [Link to other related issues]
   ```

4. Labels: `tier-1`, `blocking`, `production-critical`
5. Milestone: `Production Ready v1.0`
6. Assignee: [Team member specializing in this area]

#### Option B: Automated (Using GitHub CLI)

```bash
# Install GitHub CLI if not present
brew install gh

# Example: Create Tier-1.1 issue
gh issue create \
  --title "1.1: Re-enable TypeScript/ESLint Build Failures" \
  --body "$(cat << 'EOF'
## Problem
Hidden runtime bugs shipped to production; deploy failures go undetected

## Impact
🔴 CRITICAL - TypeScript/ESLint errors are hidden from build

## Files Affected
- next.config.ts (lines 27-31)
- package.json (build script)

## Changes Required
1. Remove both \`ignore*\` settings from next.config.ts
2. Run npm run build and npm run typecheck locally
3. Fix ALL TypeScript errors until build is clean
4. Fix ALL ESLint violations

## Acceptance Criteria
- [ ] npm run build runs clean with no type errors
- [ ] npm run typecheck reports 0 errors
- [ ] npm run lint reports 0 errors
- [ ] CI pipeline blocks merge if any check fails

## Estimated Effort
2-3 days

See PRODUCTION_ROADMAP.md for full details
EOF
)" \
  --label "tier-1,blocking,production-critical" \
  --milestone "Production Ready v1.0"
```

### 3. Create a Project Board

Go to GitHub → **Projects** → **New Project**

Structure:
```
Todo (Tier 1)
  │
  ├─ 1.1: TS/ESLint
  ├─ 1.2: App Check
  ├─ 1.3: Firestore Rules
  ├─ 1.4: Admin Auth
  ├─ 1.5: Payment Idempotency
  ├─ 1.6: Server-Side Totals
  └─ 1.7: Inventory Transactions
  
In Progress (Current work)
  │
  └─ [Issues being actively worked]

In Review (PR pending)
  │
  └─ [PRs waiting for review]

Done (Completed)
  │
  └─ [Merged to main]
```

### 4. Track Progress

**Daily Standup Template:**
```markdown
## Production Roadmap Status - [Date]

### Completed Today
- [ ] Issue #XXX: [Title]
- [ ] Issue #YYY: [Title]

### In Progress
- [ ] Issue #ZZZ: [Title] (Owner: @name)

### Blockers
- None

### Timeline
Tier 1 complete: [ETA]
Tier 2 complete: [ETA]
Production launch: [ETA]
```

---

## Recommended Team Structure

For fastest execution, assign by **expertise**:

| Tier | Issue | Owner | Parallel Pairs |
|---|---|---|---|
| 1.1 | TS/ESLint Build | Backend Lead | (with 1.2) |
| 1.2 | App Check | DevOps/Security | (with 1.1) |
| 1.3 | Firestore Rules | Security Eng | (with 1.4) |
| 1.4 | Admin Auth | Backend Lead | (with 1.3) |
| 1.5 | Payment Idempotency | Backend Lead | (with 1.6) |
| 1.6 | Server-Side Totals | Backend Lead | (with 1.5) |
| 1.7 | Inventory Transactions | Backend Lead | - |
| **Tier 1 Total** | **7 issues** | **3 people** | **~1 week** |
| 2.1 | CI/CD Pipeline | DevOps | (with 2.2) |
| 2.2 | Order State Machine | Backend Lead | (with 2.1) |
| 2.3 | Guard Seed Script | Backend Lead | (with 2.4) |
| 2.4 | Error Tracking | DevOps | (with 2.3) |
| 2.5 | Audit Logs | Backend Lead | - |

---

## Code Review Checklist

For each issue's PR:

### Tier-1 Issues (Strict Review)
- [ ] All files from "Files Affected" section touched
- [ ] All acceptance criteria met
- [ ] No regressions in related functionality
- [ ] Security review if touching auth/payments
- [ ] Performance impact analyzed (if applicable)

### Tier-2 Issues (Standard Review)
- [ ] Code matches implementation spec in roadmap
- [ ] Tests added (if applicable)
- [ ] Documentation updated

### Tier-3+ Issues (Standard)
- [ ] Follows team code standards
- [ ] No breaking changes

---

## Deployment Strategy

### Staging Deployment
After each Tier-1 issue merged:
```bash
git checkout main
git pull origin main
npm run build          # Ensure no build errors
npm run typecheck      # Ensure no type errors
vercel --confirm       # Deploy to staging auto-URL
```

Test on staging before moving to next issue.

### Production Deployment (After all Tiers complete)

```bash
# 1. Final checks on main
git checkout main
git pull origin main
npm run build
npm run typecheck
npm run lint

# 2. Tag release
git tag -a v1.0-production -m "Production ready: all Tier 1-2 issues resolved"
git push origin v1.0-production

# 3. Deploy to production with confidence
vercel --prod
```

---

## Escalation Path

If you encounter **blockers**:

1. **Technical Issue:** Post in #engineering Slack channel
2. **Dependency:** Escalate to Team Lead
3. **Timeline Risk:** Escalate to Product Manager + Engineering Lead
4. **Security Concern:** Escalate to Security Lead immediately

---

## Communication Template

### Weekly Status Email

```
Subject: Mavazi Market Production Readiness - Week X Update

Hi Team,

## Tier 1 Progress (Blocking)
- ✅ DONE (3/7):
  - 1.1: TS/ESLint
  - 1.2: App Check
  - 1.4: Admin Auth

- 🔄 IN PROGRESS (2/7):
  - 1.3: Firestore Rules (90% complete, review pending)
  - 1.5: Payment Idempotency (50% complete, testing)

- ⏳ TODO (2/7):
  - 1.6: Server-Side Totals
  - 1.7: Inventory Transactions

## Key Metrics
- Build time: 45 seconds
- Test execution: 2 min 30 sec
- Code coverage: 65%
- Production issues: 0

## Next Week Goals
- Complete 1.6 + 1.7
- Merge all Tier-1 PRs
- Begin Tier-2 work

## Risks
- None identified

## Questions?
Reply-all or ping me on Slack.

Thanks,
[Your Name]
```

---

## Reference: File Map

When working on roadmap tasks, these files are most frequently modified:

| Task | Primary Files | Secondary Files |
|---|---|---|
| 1.1 TS/ESLint | next.config.ts | All .ts/.tsx files |
| 1.2 App Check | src/lib/firebase.ts | src/app/layout.tsx |
| 1.3 Firestore Rules | firestore.rules | firebase.rules |
| 1.4 Admin Auth | src/contexts/AuthContext.tsx | src/app/admin/customers/actions.ts |
| 1.5 Idempotency | src/app/checkout/actions.ts | src/app/api/payments/ |
| 1.6 Server Totals | src/app/checkout/actions.ts | src/lib/types.ts |
| 1.7 Inventory | src/app/checkout/actions.ts | src/lib/types.ts, firestore.rules |

---

## Emergency: Production Bug Found

If a bug is found in production:

1. Create emergency issue (label: `emergency-prod`)
2. Create hotfix branch: `hotfix/brief-description`
3. Fix + test locally
4. Create PR with `[HOTFIX]` prefix
5. Skip normal review if critical (but document why)
6. Deploy immediately to production
7. Tag release: `v1.0.1-hotfix`
8. Postmortem: why wasn't this caught in Tier 1?

---

## Success Metrics

By end of Tier 1 completion:

| Metric | Target |
|---|---|
| Build errors | 0 |
| TypeScript errors | 0 |
| Lint violations | 0 |
| Test coverage | TBD (add tests in Tier 2) |
| Security vulnerabilities | 0 critical |
| Performance (Lighthouse) | 80+ |

---

**Last Updated:** March 19, 2026

For questions or clarifications on any roadmap item, see PRODUCTION_ROADMAP.md or contact Tech Lead.
