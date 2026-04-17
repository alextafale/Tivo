import { Redirect } from 'expo-router';

// Root redirect → Welcome / Auth flow
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
