// --- API Simulation ---
export const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Location-based data simulation helpers ---

// Helper to create a seeded pseudo-random number generator for consistent shuffling
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};

// Helper to shuffle an array based on a seed, making it deterministic for a location
export const shuffleArray = <T,>(array: T[], seed: number): T[] => {
  const newArr = [...array];
  const random = seededRandom(seed);
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
