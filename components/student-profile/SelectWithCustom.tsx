import React, { useId, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Student } from '../../types';

interface Props {
  value?: string;
  field: 'gender' | 'autismType';
  options?: readonly string[];
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
}

// Free-text input; suggestions are the presets plus every distinct value already saved on other students.
export const SelectWithCustom: React.FC<Props> = ({ value = '', field, options = [], onChange, className, placeholder }) => {
  const listId = useId();
  const students = useStore(s => s.students);
  const suggestions = useMemo(() => {
    const seen = new Map<string, string>();
    [...options, ...students.map(s => String((s as Student)[field] || '').trim())].forEach(v => {
      if (v && !seen.has(v.toLowerCase())) seen.set(v.toLowerCase(), v);
    });
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [students, options, field]);
  return (
    <>
      <input type="text" list={listId} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Type or pick a suggestion...'} className={className} />
      <datalist id={listId}>{suggestions.map(v => <option key={v} value={v} />)}</datalist>
    </>
  );
};
