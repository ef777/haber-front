import { useTheme } from '../contexts/ThemeContext';

// Gunes ikonu
function SunIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

// Ay ikonu
function MoonIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export default function ThemeToggle({ className = '' }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
      aria-label={resolvedTheme === 'light' ? 'Koyu moda gec' : 'Acik moda gec'}
      title={resolvedTheme === 'light' ? 'Koyu moda gec' : 'Acik moda gec'}
    >
      {resolvedTheme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-600" />
      ) : (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}

// Dropdown versiyonu - daha fazla kontrol icin
export function ThemeDropdown({ className = '' }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options = [
    { value: 'light', label: 'Acik', icon: SunIcon },
    { value: 'dark', label: 'Koyu', icon: MoonIcon },
    { value: 'system', label: 'Sistem', icon: SystemIcon },
  ];

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="appearance-none bg-surface border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
}

function SystemIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
