import Streams from "@/components/Streams";

export default function Creator({
  params: { creatorId },
}: {
  params: {
    creatorId: string;
  };
}) {
  return (
    <div>
      <Streams creatorId={creatorId} playVideo={false} />
    </div>
  );
}
