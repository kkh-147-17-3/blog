'use client';

import { useState, useTransition } from 'react';
import { updateSiteSetting } from '../actions';

export function AboutIntroForm({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const dirty = value !== initial;

  const onSave = () => {
    setMsg(null);
    start(async () => {
      const fd = new FormData();
      fd.set('value', value);
      const res = await updateSiteSetting('about_intro', fd);
      if (res?.error) setMsg({ kind: 'err', text: res.error });
      else setMsg({ kind: 'ok', text: '저장됐어요.' });
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="input"
        rows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="About 페이지 첫 단락에 들어갈 문장"
      />
      <div className="flex items-center gap-3">
        <button
          className="btn solid"
          onClick={onSave}
          disabled={pending || !dirty}
        >
          {pending ? '저장 중…' : '저장'}
        </button>
        {dirty && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => { setValue(initial); setMsg(null); }}
            disabled={pending}
          >
            되돌리기
          </button>
        )}
        {msg && (
          <span className={`t-meta ${msg.kind === 'err' ? 'text-cat-diary' : 'text-ink-2'}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
