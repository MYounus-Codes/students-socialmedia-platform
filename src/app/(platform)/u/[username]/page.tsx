import { ProfileView } from "@/components/profile/profile-view";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <ProfileView username={username} />;
}
