'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

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
    <div className="text-primary mx-32 my-12 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-(family-name:--font-red-hat-mono) text-[48px] leading-none font-medium">
          DATA EXPLORER
        </h1>
        <p className="font-medium">Search university data by topic</p>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border-primary bg-button text-primary rounded-full border px-4 py-2 font-medium"
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
          className="border-primary bg-button text-primary rounded-full border px-4 py-2 font-medium"
        >
          {YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <div className="border-primary flex items-center gap-2 justify-self-center rounded-full border bg-[#EFE7D2]/40 px-4 py-2">
          <Image src="/icons/search.png" alt="Search" width={18} height={18} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by university name..."
            className="text-primary placeholder:text-primary/60 w-72 bg-transparent outline-none"
          />
        </div>
        <div className="ml-4 justify-self-start">
          <button
            onClick={handleSearch}
            className="bg-button border-primary text-primary rounded-full border px-6 py-2 font-medium transition-opacity hover:opacity-80"
          >
            Search
          </button>
        </div>
      </div>

      <div>
        {isFetching && (
          <p className="text-primary/60 font-medium">Loading...</p>
        )}

        {error && (
          <p className="text-primary font-medium">{(error as Error).message}</p>
        )}

        {data && !isFetching && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[24px] font-semibold">{data.college}</h2>
            <p className="text-primary/60 text-sm">Unit ID: {data.unit_id}</p>
            <div className="border-primary overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navbar">
                    <th className="px-4 py-3 text-left font-semibold">
                      Variable
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.admissions).map(([key, entry], i) => (
                    <tr
                      key={key}
                      className={
                        i % 2 === 0 ? 'bg-white/40' : 'bg-[#EFE7D2]/20'
                      }
                    >
                      <td className="px-4 py-2 font-mono text-xs">{key}</td>
                      <td className="px-4 py-2">
                        {entry.description ?? 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
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
