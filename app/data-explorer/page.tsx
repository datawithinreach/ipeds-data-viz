'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import './page.scss';

const TOPICS = [{ value: 'admissions', label: 'Admissions' }];
const YEARS = [{ value: '2024', label: '2024–2025' }];

type AdmissionsResult = {
  college: string;
  unit_id: string;
  admissions: Record<string, { value: string; description: string }>;
};

async function fetchAdmissions(college: string): Promise<AdmissionsResult> {
  const res = await fetch(`/api/admissions/${encodeURIComponent(college)}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to fetch data');
  }
  return res.json();
}

export default function DataExplorerPage() {
  const [topic, setTopic] = useState('admissions');
  const [year, setYear] = useState('2024');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isFetching, error } = useQuery({
    queryKey: ['admissions', search],
    queryFn: () => fetchAdmissions(search),
    enabled: !!search,
    retry: false,
  });

  function handleSearch() {
    if (input.trim()) setSearch(input.trim());
  }

  return (
    <div className="dataExplorer">
      <div className="dataExplorer__header">
        <h1 className="dataExplorer__title">
          DATA EXPLORER
        </h1>
        <p className="dataExplorer__subtitle">Search university data by topic</p>
      </div>

      <div className="dataExplorer__controls">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="dataExplorer__select"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="dataExplorer__select"
        >
          {YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>
      <div className="dataExplorer__searchRow">
        <div />
        <div className="dataExplorer__searchBar">
          <Image src="/icons/search.png" alt="Search" width={18} height={18} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by university name..."
            className="dataExplorer__searchInput"
          />
        </div>
        <div className="dataExplorer__searchAction">
          <button
            onClick={handleSearch}
            className="dataExplorer__searchBtn"
          >
            Search
          </button>
        </div>
      </div>

      <div>
        {isFetching && (
          <p className="dataExplorer__loading">Loading...</p>
        )}

        {error && (
          <p className="dataExplorer__error">{(error as Error).message}</p>
        )}

        {data && !isFetching && (
          <div className="dataExplorer__results">
            <h2 className="dataExplorer__collegeName">{data.college}</h2>
            <p className="dataExplorer__unitId">Unit ID: {data.unit_id}</p>
            <div className="dataExplorer__tableWrapper">
              <table className="dataExplorer__table">
                <thead>
                  <tr className="dataExplorer__tableHead">
                    <th className="dataExplorer__th">
                      Variable
                    </th>
                    <th className="dataExplorer__th">
                      Description
                    </th>
                    <th className="dataExplorer__th dataExplorer__th--right">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.admissions).map(([key, entry]) => (
                    <tr
                      key={key}
                      className="dataExplorer__row"
                    >
                      <td className="dataExplorer__td dataExplorer__td--code">{key}</td>
                      <td className="dataExplorer__td">
                        {entry.description ?? 'N/A'}
                      </td>
                      <td className="dataExplorer__td dataExplorer__td--right">
                        {entry.value ?? 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
