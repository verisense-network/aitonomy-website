import { Card, CardBody, Avatar, Tooltip } from "@heroui/react";
import { Community } from "@verisense-network/vemodel-types";
import Link from "next/link";

export default function CommunityCard({
  community,
}: {
  community: Community & { formattedId?: string };
}) {
  return (
    <Card
      as={Link}
      key={community.id}
      isPressable
      className="min-w-20"
      href={`/c/${community.formattedId}`}
      classNames={{
        body: "overflow-hidden",
      }}
    >
      <CardBody className="flex gap-2 justify-center items-center">
        <Avatar name={community.name} src={community.logo} />
        <div className="flex justify-center items-center w-full text-center">
          <Tooltip content={community.name} placement="bottom">
            <span className="block text-nowrap overflow-hidden text-ellipsis text-truncate w-5/6">
              {community.name}
            </span>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
}
