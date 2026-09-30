import React from 'react';
export default function ProgressIndicator({ index = 0, completed = false }) {
  return <div className="progress" aria-label={completed ? '10 / 10 completed' : `Clip ${index + 1} / 10`}>
    <div className="progress-label"><span>{completed ? 'Daily immersion' : `Clip ${String(index + 1).padStart(2, '0')} of 10`}</span><span>{completed ? '10 / 10 Completed' : `${(index + 1) * 10}% Completed`}</span></div>
    <div className="segments" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} className={completed || i <= index ? 'filled' : ''}/>)}</div>
  </div>;
}
