'use client';

interface Platform {
  id: string;
  name: string;
  icon: string;
}

const platforms: Platform[] = [
  { id: 'macOS', name: 'macOS', icon: '🍎' },
  { id: 'Windows', name: 'Windows', icon: '🪟' },
  { id: 'Linux', name: 'Linux', icon: '🐧' },
];

interface PlatformNavProps {
  selected: string;
  onSelect: (platform: string) => void;
  availablePlatforms: string[];
}

export function PlatformNav({ selected, onSelect, availablePlatforms }: PlatformNavProps) {
  return (
    <nav className="space-y-1">
      {platforms.map((platform) => {
        const isAvailable = availablePlatforms.includes(platform.id);
        const isSelected = selected === platform.id;

        return (
          <button
            key={platform.id}
            onClick={() => isAvailable && onSelect(platform.id)}
            disabled={!isAvailable}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
              ${isSelected
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : isAvailable
                  ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  : 'text-slate-600 cursor-not-allowed'
              }
            `}
          >
            <span className="text-xl">{platform.icon}</span>
            <span className="font-medium">{platform.name}</span>
            {!isAvailable && (
              <span className="ml-auto text-xs text-slate-600">暂不可用</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
