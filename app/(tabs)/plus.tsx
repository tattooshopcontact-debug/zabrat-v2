import { Redirect } from 'expo-router';

// Placeholder — the [+] tab button navigates to /log-beer modal instead
export default function PlusPlaceholder() {
  return <Redirect href="/log-beer" />;
}
