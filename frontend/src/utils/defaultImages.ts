export const getDefaultCourseThumbnail = (title: string = 'Curso') => {
  // Generate a color based on the title
  const colors = [
    { primary: '#8b5cf6', secondary: '#3b82f6' }, // Purple to Blue
    { primary: '#ef4444', secondary: '#f59e0b' }, // Red to Orange
    { primary: '#10b981', secondary: '#06b6d4' }, // Green to Cyan
    { primary: '#6366f1', secondary: '#8b5cf6' }, // Indigo to Purple
    { primary: '#f59e0b', secondary: '#eab308' }, // Orange to Yellow
    { primary: '#ec4899', secondary: '#a855f7' }, // Pink to Purple
  ];
  
  const colorIndex = title.length % colors.length;
  const { primary, secondary } = colors[colorIndex];
  
  // Get first letter of title for display and escape it
  const firstLetter = title.charAt(0).toUpperCase().replace(/[<>&'"]/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return entities[char] || char;
  });
  
  // Escape title for XML
  const escapedTitle = title.replace(/[<>&'"]/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return entities[char] || char;
  });
  
  const displayTitle = escapedTitle.length > 30 ? escapedTitle.substring(0, 30) + '...' : escapedTitle;
  
  const svg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f8fafc"/>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="100" y="50" width="200" height="150" rx="10" fill="url(#grad1)" opacity="0.1"/>
  <g transform="translate(200, 125)">
    <path d="M -40 -30 L -40 30 L 0 40 L 40 30 L 40 -30 L 0 -20 Z" fill="url(#grad1)" opacity="0.9"/>
    <path d="M 0 -20 L 0 40" stroke="white" stroke-width="3" fill="none"/>
    <path d="M -40 -30 L 0 -20 L 40 -30" stroke="white" stroke-width="3" fill="none"/>
    <circle cx="0" cy="0" r="20" fill="white" opacity="0.9"/>
    <text x="0" y="5" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="${primary}" text-anchor="middle">${firstLetter}</text>
  </g>
  <rect x="0" y="250" width="400" height="50" fill="url(#grad1)" opacity="0.05"/>
  <text x="200" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">${displayTitle}</text>
</svg>`;
  
  // Convert to data URL using encodeURIComponent for better compatibility
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const getDefaultUserAvatar = (name: string = 'User') => {
  const colors = [
    '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'
  ];
  
  const colorIndex = name.length % colors.length;
  const color = colors[colorIndex];
  const initials = name.split(' ').map(n => n.charAt(0).toUpperCase()).slice(0, 2).join('');
  
  // Escape initials for XML
  const escapedInitials = initials.replace(/[<>&'"]/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return entities[char] || char;
  });
  
  const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="50" fill="${color}"/>
  <text x="50" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="600" fill="white" text-anchor="middle" dy="0.35em">${escapedInitials}</text>
</svg>`;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};