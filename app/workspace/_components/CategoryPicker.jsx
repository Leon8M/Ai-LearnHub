'use client';
import React, { useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Plus, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/constants/categories';

export const MAX_CATEGORIES = 5;
const MAX_CUSTOM_LENGTH = 35; // 5 x 35 chars + separators stays under the server's 200-char limit
const POPULAR_COUNT = 24;
const RESULT_LIMIT = 40;

// CATEGORIES is sorted alphabetically and has duplicates.
const ALL = [...new Set(CATEGORIES)];

// Shown before the user types. Picked by hand (the source list is alphabetical, so its first
// entries are things like "3D Modeling (Art)"); only names that exist in the list are kept.
const POPULAR = [
  'Programming', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'Cybersecurity', 'Cloud Computing', 'UI/UX Design', 'Business', 'Entrepreneurship', 'Finance',
  'Personal Finance', 'Digital Marketing', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Literature', 'Foreign Languages', 'Health & Fitness', 'Agriculture', 'Music', 'Photography',
].filter((c) => ALL.includes(c)).slice(0, POPULAR_COUNT);

const normalize = (text) => text.replace(/\s+/g, ' ').trim().slice(0, MAX_CUSTOM_LENGTH);

/** Rank matches: names starting with the query first, then names containing it. */
function search(query) {
  const q = query.toLowerCase();
  const starts = [];
  const contains = [];
  for (const category of ALL) {
    const lower = category.toLowerCase();
    if (lower.startsWith(q)) starts.push(category);
    else if (lower.includes(q)) contains.push(category);
  }
  return [...starts, ...contains];
}

/**
 * Category selection in its own modal. It replaces a popover combobox that couldn't be typed
 * into: the popover rendered outside the course dialog, whose focus trap kept stealing focus
 * from its search box. A nested dialog takes over focus properly while it's open.
 */
export default function CategoryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const trimmed = normalize(query);
  const matches = useMemo(() => (trimmed ? search(trimmed) : POPULAR), [trimmed]);
  const shown = matches.slice(0, RESULT_LIMIT);
  const exactMatch = ALL.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  const canAddCustom = trimmed.length >= 2 && !exactMatch && !draft.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  const full = draft.length >= MAX_CATEGORIES;

  const openPicker = () => {
    setDraft(value);
    setQuery('');
    setOpen(true);
  };

  const toggle = (category) => {
    setDraft((current) => {
      if (current.includes(category)) return current.filter((c) => c !== category);
      if (current.length >= MAX_CATEGORIES) return current;
      return [...current, category];
    });
    inputRef.current?.focus();
  };

  const addCustom = () => {
    if (!canAddCustom || full) return;
    setDraft((current) => [...current, trimmed]);
    setQuery('');
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (exactMatch) toggle(exactMatch);
    else if (canAddCustom) addCustom();
    else if (shown[0]) toggle(shown[0]);
    setQuery('');
  };

  const done = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      {/* Field in the course form: shows the picks, opens the picker. */}
      <button
        type="button"
        onClick={openPicker}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        aria-haspopup="dialog"
      >
        <span className="flex flex-1 flex-wrap gap-1.5">
          {value.length ? (
            value.map((category) => (
              <span key={category} className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-medium text-[var(--primary-foreground)]">
                {category}
              </span>
            ))
          ) : (
            <span className="text-[var(--muted-foreground)]">Choose categories...</span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[85vh] w-[95vw] flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--foreground)] sm:max-w-lg"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading">Choose categories</DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              Pick up to {MAX_CATEGORIES} that describe your course, or add your own.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search, e.g. Robotics, Kiswahili, Accounting"
              maxLength={60}
              aria-label="Search categories"
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] pl-9 pr-9 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {draft.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label="Selected categories">
              {draft.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggle(category)}
                  className="flex items-center gap-1 rounded-full bg-[var(--primary)] py-1 pl-3 pr-2 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90"
                  aria-label={`Remove ${category}`}
                >
                  {category}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1" onWheel={(e) => e.stopPropagation()}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {trimmed ? `${matches.length} match${matches.length === 1 ? '' : 'es'}` : 'Popular'}
            </p>

            {canAddCustom && (
              <button
                type="button"
                onClick={addCustom}
                disabled={full}
                className="mb-3 flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--primary)] px-3 py-2.5 text-left text-sm font-medium text-[var(--primary)] hover:bg-[var(--accent)] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add &ldquo;{trimmed}&rdquo; as a category
                <span className="ml-auto text-xs font-normal text-[var(--muted-foreground)]">Enter</span>
              </button>
            )}

            {shown.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {shown.map((category) => {
                  const selected = draft.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggle(category)}
                      disabled={!selected && full}
                      aria-pressed={selected}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        selected
                          ? 'border-[var(--primary)] bg-[var(--accent)] font-medium text-[var(--primary)]'
                          : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                      {category}
                    </button>
                  );
                })}
              </div>
            ) : (
              !canAddCustom && <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">No categories found.</p>
            )}

            {matches.length > RESULT_LIMIT && (
              <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
                Showing {RESULT_LIMIT} of {matches.length}. Keep typing to narrow it down.
              </p>
            )}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-[var(--border)] pt-4 sm:justify-between">
            <span className={`text-sm ${full ? 'font-medium text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>
              {draft.length}/{MAX_CATEGORIES} selected
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setDraft([])} disabled={!draft.length}>
                Clear
              </Button>
              <Button type="button" className="btn-primary" onClick={done}>
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
