import Tooltip from './Tooltip';

interface StatsProps {
  emDashes: number;
  cliches: number;
  jargon: number;
  aiTells: number;
  readabilityScore: number | null;
  hiddenTypes: Set<string>;
  activeType: string | null;
  onToggle: (type: string) => void;
  onSetActive: (type: string) => void;
}

const StatBox = ({ title, value, color, type, onToggle, isHidden, tooltipText, isActive, onSetActive }: { title: string, value: number | string, color: string, type: string, onToggle: (type: string) => void, isHidden: boolean, tooltipText: string, isActive: boolean, onSetActive: (type: string) => void }) => {
  const handleClick = () => {
    onSetActive(type);
    onToggle(type);
  };
  
  return (
    <Tooltip text={tooltipText}>
      <button 
        onClick={handleClick} 
        className={`p-4 rounded-lg text-center transition-all duration-200 transform hover:scale-110 ${isHidden ? 'opacity-50' : 'opacity-100'} ${isActive ? 'ring-2 ring-white' : ''}`} 
        style={{ backgroundColor: `${color}20` }}
      >
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm">{title}</p>
      </button>
    </Tooltip>
  );
};

export default function Stats({ emDashes, cliches, jargon, aiTells, readabilityScore, hiddenTypes, activeType, onToggle, onSetActive }: StatsProps) {
  const stats = [
    { title: 'Em-Dashes', value: emDashes, color: '#14b8a6', type: 'em_dash', tooltip: 'Click to toggle em-dash highlights' },
    { title: 'Cliches', value: cliches, color: '#8b5cf6', type: 'cliche', tooltip: 'Click to toggle cliche highlights' },
    { title: 'Jargon', value: jargon, color: '#f59e0b', type: 'jargon', tooltip: 'Click to toggle jargon highlights' },
    { title: 'AI Tells', value: aiTells, color: '#ec4899', type: 'ai_tell', tooltip: 'Click to toggle AI tell highlights' },
    { title: 'Readability', value: readabilityScore ? readabilityScore.toFixed(1) : 'N/A', color: '#3b82f6', type: 'readability', tooltip: 'Flesch-Kincaid grade level' },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-center">
      {stats.map(stat => (
        <div key={stat.type} className="flex-grow">
          <StatBox 
            title={stat.title} 
            value={stat.value} 
            color={stat.color} 
            type={stat.type}
            onToggle={onToggle}
            isHidden={hiddenTypes.has(stat.type)}
            tooltipText={stat.tooltip}
            isActive={activeType === stat.type}
            onSetActive={onSetActive}
          />
        </div>
      ))}
    </div>
  );
}
