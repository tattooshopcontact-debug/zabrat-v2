import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar } from '../../constants/theme';

// Padding bas à appliquer au contenu scrollable de chaque écran sous la tab bar
// (la tab bar est position:absolute — hauteur + inset système + marge de confort).
export function useTabBarPadding(): number {
  const insets = useSafeAreaInsets();
  return TabBar.height + insets.bottom + 32;
}

// Offset bas pour les éléments flottants posés juste au-dessus de la tab bar
// (bottom sheets, lignes sticky).
export function useAboveTabBarOffset(): number {
  const insets = useSafeAreaInsets();
  return TabBar.height + insets.bottom + 16;
}
