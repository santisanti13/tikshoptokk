

## Problem

The blog posts are not displaying because `publishedAt` is `null` on all 3 posts in Sanity. The `BlogCard` component crashes or renders incorrectly when trying to format a null date.

## Root Cause

When the posts were created via the Sanity MCP tool, the `publishedAt` field was not set.

## Plan

### Step 1: Patch Sanity documents
Set `publishedAt` to a valid date on all 3 posts using the Sanity MCP `patch_document_from_json` tool:
- `6f4b14a4-...` → `2026-03-15`
- `d8c5184f-...` → `2026-03-20`
- `b1250cc8-...` → `2026-03-25`

Then publish all 3 documents.

### Step 2: Add null-safety in BlogCard
Update `BlogCard.tsx` to gracefully handle a missing `publishedAt` — hide the date instead of crashing if it's null.

### Step 3: Add null-safety in BlogPost
Same defensive check in `BlogPost.tsx` for the date display.

### Technical Details
- 3 Sanity MCP calls to patch documents + 1 publish call
- Minor edits to `BlogCard.tsx` and `BlogPost.tsx` to add conditional date rendering

