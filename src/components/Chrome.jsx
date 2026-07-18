import React from 'react';

// iOS-style status bar (9:41 + signal + battery), matching the design handoff.
export function StatusBar({ dark }) {
  const c = dark ? '#fff' : 'rgba(245,245,247,.85)';
  return (
    <div className="rstat">
      <span style={{ font: "600 15px/1 'Outfit'", color: dark ? '#fff' : '#F5F5F7' }}>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="7" width="3" height="5" rx=".5" fill={c} /><rect x="5" y="4.5" width="3" height="7.5" rx=".5" fill={c} /><rect x="10" y="2" width="3" height="10" rx=".5" fill={c} /><rect x="15" y="0" width="3" height="12" rx=".5" fill={c} /></svg>
        <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="2.5" stroke="rgba(245,245,247,.35)" strokeWidth="1" fill="none" /><rect x="23.5" y="3.5" width="2" height="5" rx="1" fill="rgba(245,245,247,.35)" /><rect x="2" y="2" width="17" height="8" rx="1.5" fill={c} /></svg>
      </div>
    </div>
  );
}

const TAB_ICONS = {
  explore: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  assistant: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.13.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
  history: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  profile: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
};

const TABS = [
  { id: 'explore', label: 'Home' },
  { id: 'assistant', label: 'Ask AI' },
  { id: 'history', label: 'History' },
  { id: 'profile', label: 'Profile' },
];

export function TabBar({ active, onTab }) {
  return (
    <div className="rtab">
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} type="button" className={`rtab-item ${on ? 'active' : ''}`} aria-current={on ? 'page' : undefined} onClick={() => onTab(t.id)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? '#34D399' : 'rgba(245,245,247,.32)'} strokeWidth={on ? 1.6 : 1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={TAB_ICONS[t.id]} />
            </svg>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
