'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { loginAction } from '../actions';

interface State { error?: string }

async function action(_prev: State, formData: FormData): Promise<State> {
  const r = await loginAction(formData);
  return r ?? {};
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn solid"
      disabled={pending}
      style={{ marginTop: 'var(--s-2)', justifyContent: 'center' }}
    >
      {pending ? '로그인 중…' : '로그인'}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<State, FormData>(action, {});

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <div>
        <label className="t-meta-up" style={{ display: 'block', marginBottom: 6 }}>이메일</label>
        <input className="input" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="t-meta-up" style={{ display: 'block', marginBottom: 6 }}>비밀번호</label>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <div className="t-meta" style={{ color: 'var(--cat-diary)' }}>{state.error}</div>
      )}
      <SubmitBtn />
    </form>
  );
}
