/**
 * TIVO POS — Color System
 * Premium dark theme with electric accent
 */

export const Colors = {
  // === Brand core ===
  primary: '#6C63FF',       // Electric violet — primary CTA
  primaryLight: '#8B85FF',
  primaryDark: '#4D46CC',
  accent: '#00D9A3',        // Neon mint — success / active
  accentDark: '#00A87D',
  warning: '#FFB547',       // Amber — alerts / warnings
  danger: '#FF5A65',        // Rose — errors / delete
  dangerLight: '#FF8A92',
  info: '#4FC3F7',          // Sky blue — info

  // === Background layers ===
  bg: '#0D0F1A',            // Deepest background
  bgSurface: '#13162A',     // Cards, panels
  bgElevated: '#1A1E35',    // Modals, bottom sheets
  bgOverlay: '#222743',     // Input fields, hover states

  // === Borders ===
  border: '#252A45',
  borderLight: '#2F3554',
  borderFocus: '#6C63FF',

  // === Text ===
  textPrimary: '#F0F2FF',
  textSecondary: '#8A90B4',
  textMuted: '#4A5180',
  textInverse: '#0D0F1A',

  // === Status / semantic ===
  success: '#00D9A3',
  successBg: 'rgba(0, 217, 163, 0.12)',
  warningBg: 'rgba(255, 181, 71, 0.12)',
  dangerBg: 'rgba(255, 90, 101, 0.12)',
  infoBg: 'rgba(79, 195, 247, 0.12)',
  primaryBg: 'rgba(108, 99, 255, 0.12)',

  // === Utility ===
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // === Glassmorphism ===
  glass: 'rgba(26, 30, 53, 0.85)',
  glassBorder: 'rgba(108, 99, 255, 0.2)',

  // === Gradients (used as array for LinearGradient) ===
  gradientPrimary: ['#6C63FF', '#4D46CC'] as [string, string],
  gradientAccent: ['#00D9A3', '#00A87D'] as [string, string],
  gradientCard: ['#1A1E35', '#13162A'] as [string, string],
  gradientDark: ['#0D0F1A', '#13162A'] as [string, string],
};

export default Colors;
