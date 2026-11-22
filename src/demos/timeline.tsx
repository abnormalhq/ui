import { CheckIcon, MailIcon, SendIcon } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";

export const defaultCopy = {
  updates: "Updates",
  completed: "Completed",
  serversUpdated: "Every server is back on the new version.",
  inProgress: "In progress",
  deliveryDelay: "Mail may arrive a few minutes late.",
  scheduled: "Scheduled",
  scheduledTime: "10 Nov, 09:00",
  delivery: "Delivery",
  received: "Received",
  sending: "Sending to gmail.com",
  delivered: "Delivered",
};

export default function TimelineDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-md gap-10">
      <Timeline aria-label={copy.updates}>
        <TimelineItem tone="success">
          <TimelineHeader>
            <TimelineTitle>{copy.completed}</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T04:10:00Z">04:10</TimelineTime>
          </TimelineHeader>
          <TimelineContent>{copy.serversUpdated}</TimelineContent>
        </TimelineItem>
        <TimelineItem tone="pending">
          <TimelineHeader>
            <TimelineTitle>{copy.inProgress}</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T03:00:00Z">03:00</TimelineTime>
          </TimelineHeader>
          <TimelineContent>{copy.deliveryDelay}</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineHeader>
            <TimelineTitle>{copy.scheduled}</TimelineTitle>
            <TimelineTime dateTime="2026-11-10T09:00:00Z">{copy.scheduledTime}</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
      </Timeline>
      <Timeline aria-label={copy.delivery}>
        <TimelineItem icon={<MailIcon />}>
          <TimelineHeader>
            <TimelineTitle>{copy.received}</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T08:01:12Z">08:01:12</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
        <TimelineItem icon={<SendIcon />} tone="current">
          <TimelineHeader>
            <TimelineTitle>{copy.sending}</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T08:01:13Z">08:01:13</TimelineTime>
          </TimelineHeader>
          <TimelineContent>250 2.0.0 OK</TimelineContent>
        </TimelineItem>
        <TimelineItem icon={<CheckIcon />} tone="success">
          <TimelineHeader>
            <TimelineTitle>{copy.delivered}</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T08:01:14Z">08:01:14</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
