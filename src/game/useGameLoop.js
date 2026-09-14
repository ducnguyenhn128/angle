import { useState, useCallback } from 'react';

export function useGameLoop(target = 150) {
  const [state, setState] = useState({ score: 0, streak: 0 });

  const correct = useCallback(() => {
    setState((s) => {
      const streak = s.streak + 1;
      const gain = 10 + (streak >= 3 ? 5 : 0);
      return { streak, score: Math.min(target, s.score + gain) };
    });
  }, [target]);

  const wrong = useCallback(() => {
    setState((s) => ({ ...s, streak: 0 }));
  }, []);

  const reset = useCallback(() => {
    setState({ score: 0, streak: 0 });
  }, []);

  return { ...state, correct, wrong, reset, won: state.score >= target };
}
