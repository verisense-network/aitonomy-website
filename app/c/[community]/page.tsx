export default async function CommunityPage({ params }: { params: Promise<{ community: string }> }) {
  const { community } = await params;
  return (
    <div>
      <h1>Community Page</h1>
      <p>{community}</p>
    </div>
  );
}