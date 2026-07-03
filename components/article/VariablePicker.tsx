'use client';

import { useMemo, useState } from 'react';
import { isChartableVariable, SURVEYS, type SurveyCode } from '@/lib/articles/datasetsClient';
import { buildPickerLayout, type GroupedPickerEntry } from '@/lib/articles/variableGroups';
import './VariablePicker.scss';

type Props = {
  survey: SurveyCode;
  selected: string[];
  onToggle: (code: string) => void;
  /** Maximum count across all selections (e.g., 8 for chart vars, 12 for generation). */
  maxTotal?: number;
  /** Total currently selected across this picker (for disable logic when shared with other surveys). */
  selectedTotal?: number;
  className?: string;
  emptyHint?: string;
};

export function VariablePicker({
  survey,
  selected,
  onToggle,
  maxTotal,
  selectedTotal,
  className,
  emptyHint,
}: Props) {
  const meta = SURVEYS[survey];
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const layout: GroupedPickerEntry[] = useMemo(
    () => buildPickerLayout(survey, meta.variables, (c) => isChartableVariable(survey, c)),
    [survey, meta.variables],
  );

  const filterTerm = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!filterTerm) return layout;
    return layout
      .map((g) => ({
        ...g,
        available: g.available.filter(
          (v) => v.code.toLowerCase().includes(filterTerm) || v.description.toLowerCase().includes(filterTerm),
        ),
      }))
      .filter((g) => g.available.length > 0);
  }, [layout, filterTerm]);

  function toggleOpen(id: string) {
    setOpenIds((p) => ({ ...p, [id]: !p[id] }));
  }

  function isOpen(g: GroupedPickerEntry): boolean {
    if (filterTerm) return true;
    if (g.group.id in openIds) return openIds[g.group.id];
    return Boolean(g.group.featured);
  }

  const total = selectedTotal ?? selected.length;
  const atLimit = maxTotal !== undefined && total >= maxTotal;

  return (
    <div className={`varPicker ${className ?? ''}`}>
      <div className="varPicker__searchRow">
        <input
          className="varPicker__search"
          type="text"
          placeholder={`Search ${meta.short.toLowerCase()} variables…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filterTerm && (
          <button type="button" className="varPicker__clear" onClick={() => setSearch('')}>
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="varPicker__empty">
          No variables match &ldquo;{filterTerm}&rdquo;. {emptyHint}
        </p>
      )}

      <div className="varPicker__groups">
        {filtered.map((g) => {
          const open = isOpen(g);
          const groupSelected = g.available.filter((v) => selected.includes(v.code)).length;
          return (
            <section
              key={g.group.id}
              className={`varPicker__group${g.group.featured ? ' varPicker__group--featured' : ''}`}
            >
              <button
                type="button"
                className="varPicker__groupHeader"
                onClick={() => toggleOpen(g.group.id)}
                aria-expanded={open}
              >
                <span className="varPicker__groupCaret" aria-hidden>
                  {open ? '▾' : '▸'}
                </span>
                <span className="varPicker__groupTitle">
                  {g.group.featured && <span className="varPicker__star" aria-hidden>★</span>}
                  {g.group.label}
                </span>
                <span className="varPicker__groupCount">
                  {groupSelected > 0 && <strong>{groupSelected} selected · </strong>}
                  {g.available.length} {g.available.length === 1 ? 'variable' : 'variables'}
                </span>
              </button>
              {open && (
                <div className="varPicker__groupBody">
                  {g.group.hint && <p className="varPicker__groupHint">{g.group.hint}</p>}
                  <div className="varPicker__list">
                    {g.available.map(({ code, description }) => {
                      const checked = selected.includes(code);
                      const disabled = !checked && atLimit;
                      return (
                        <label key={code} className="varPicker__item">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => onToggle(code)}
                          />
                          <span className="varPicker__itemText">
                            <span className="varPicker__itemLabel">{description}</span>
                            <span className="varPicker__itemCode">{code}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
