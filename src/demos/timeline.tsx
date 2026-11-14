import { CheckIcon, MailIcon, SendIcon } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";

export default function TimelineDemo() {
  return (
    <div className="grid w-full max-w-md gap-10">
      <Timeline aria-label="Updates">
        <TimelineItem tone="success">
          <TimelineHeader>
            <TimelineTitle>Completed</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T04:10:00Z">04:10</TimelineTime>
          </TimelineHeader>
          <TimelineContent>Every server is back on the new version.</TimelineContent>
        </TimelineItem>
        <TimelineItem tone="pending">
          <TimelineHeader>
            <TimelineTitle>In progress</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T03:00:00Z">03:00</TimelineTime>
          </TimelineHeader>
          <TimelineContent>Mail may arrive a few minutes late.</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineHeader>
            <TimelineTitle>Scheduled</TimelineTitle>
            <TimelineTime dateTime="2026-11-10T09:00:00Z">10 Nov, 09:00</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
      </Timeline>
      <Timeline aria-label="Delivery">
        <TimelineItem icon={<MailIcon />}>
          <TimelineHeader>
            <TimelineTitle>Received</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T08:01:12Z">08:01:12</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
        <TimelineItem icon={<SendIcon />} tone="current">
          <TimelineHeader>
            <TimelineTitle>Sending to gmail.com</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T08:01:13Z">08:01:13</TimelineTime>
          </TimelineHeader>
          <TimelineContent>250 2.0.0 OK</TimelineContent>
        </TimelineItem>
        <TimelineItem icon={<CheckIcon />} tone="success">
          <TimelineHeader>
            <TimelineTitle>Delivered</TimelineTitle>
            <TimelineTime dateTime="2026-11-14T08:01:14Z">08:01:14</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
