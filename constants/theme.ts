export const tokens = {
  colors: {
    common: {
      accent: "#8B6DAE",
      accentSoft: "#C4AED8",
      success: "#A8C5A0",
      warning: "#E8C88A",
      white: "#FFFFFF",
      // Category base colors (used for icons and tinted backgrounds)
      lavender: "#E8DFF0",
      softBlue: "#C8DEF0",
      blush: "#F0D8D0",
      cream: "#F5F0E8",
      // Scene/Category icons
      sleepIcon: "#6B5A8E",
      soundsIcon: "#2B5A80",
      storiesIcon: "#8B4A40",
      gamesIcon: "#6B6560",
    },
    light: {
      bgPrimary: "#F8F4EE",
      bgCard: "#FFFFFF",
      bgMuted: "#F0EBE3",
      textPrimary: "#2D2B3D",
      textSecondary: "#7A7589",
      textMuted: "#A9A3B5",
      border: "#E8E2D8",
      navBackground: "#F8F4EE",
      accentLight: "#EDE5F5",
      // Category backgrounds (solid in light)
      sleepBg: "#E8DFF0",
      soundsBg: "#C8DEF0",
      storiesBg: "#F0D8D0",
      gamesBg: "#F5F0E8",
      overtitle: "#8B6DAE",
      soundsVibrant: "#A3C6E5",
      storiesVibrant: "#E5C4B8",
      sleepVibrant: "#D6C8E5",
    },
    dark: {
      bgPrimary: "#2D2B3D",
      bgCard: "#3D3A52",
      bgMuted: "#3D3A52",
      textPrimary: "#F5F0E8",
      textSecondary: "#C4AED8",
      textMuted: "#A9A3B5",
      border: "rgba(255,255,255,0.08)",
      navBackground: "#2D2B3D",
      accentLight: "#3D3A52",
      // Category backgrounds (15% opacity in dark)
      sleepBg: "rgba(232, 223, 240, 0.15)",
      soundsBg: "rgba(200, 222, 240, 0.15)",
      storiesBg: "rgba(240, 216, 208, 0.15)",
      gamesBg: "rgba(245, 240, 232, 0.15)",
      overtitle: "#C4AED8",
      soundsVibrant: "rgba(200, 222, 240, 0.25)",
      storiesVibrant: "rgba(240, 216, 208, 0.25)",
      sleepVibrant: "rgba(232, 223, 240, 0.25)",
    }
  },
  
  fonts: {
    heading: "Nunito_900Black",
    body: "Nunito_500Medium",
    caption: "Nunito_800ExtraBold",
  },
  
  radii: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 80,
  },
  
  shadows: {
    card: {
      shadowColor: "#2D2B3D",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    elevated: {
      shadowColor: "#2D2B3D",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 8,
    },
    floating: {
      shadowColor: "#2D2B3D",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
    },
  },
  
  layout: {
    contentMaxWidth: 620,
  },
};

export const Colors = { light: { ...tokens.colors.common, ...tokens.colors.light }, dark: { ...tokens.colors.common, ...tokens.colors.dark } } as any;
export const Fonts = { ...tokens.fonts, mono: 'Apple SD Gothic Neo', rounded: 'Apple SD Gothic Neo' } as any;
