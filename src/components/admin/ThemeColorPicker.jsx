const themes = [
  { id: 'blue', label: 'Blue', className: 'swatch-blue' },
  { id: 'purple', label: 'Purple', className: 'swatch-purple' },
  { id: 'pink', label: 'Pink', className: 'swatch-pink' },
  { id: 'mint', label: 'Mint Green', className: 'swatch-mint' },
  { id: 'black', label: 'Black', className: 'swatch-black' },
];

export default function ThemeColorPicker({ value, onChange }) {
  return (
    <div>
      <div className="theme-picker">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-swatch ${theme.className} ${value === theme.id ? 'selected' : ''}`}
            onClick={() => onChange(theme.id)}
            title={theme.label}
            aria-label={`Select ${theme.label} theme`}
          />
        ))}
      </div>
      {value && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Selected: {themes.find(t => t.id === value)?.label}
        </p>
      )}
    </div>
  );
}
