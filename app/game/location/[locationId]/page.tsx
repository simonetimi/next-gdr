export default async function page({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const locationId = (await params).locationId;
  return <div>{locationId}</div>;
}
