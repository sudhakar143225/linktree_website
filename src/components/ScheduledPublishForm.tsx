import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduledPublishFormProps {
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
  timezone?: string;
  onPublishChange: (date: Date | null) => void;
  onUnpublishChange: (date: Date | null) => void;
  onTimezoneChange: (timezone: string) => void;
}

const ScheduledPublishForm = ({
  scheduledPublishAt,
  scheduledUnpublishAt,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  onPublishChange,
  onUnpublishChange,
  onTimezoneChange,
}: ScheduledPublishFormProps) => {
  const [publishDate, setPublishDate] = useState<Date | null>(
    scheduledPublishAt ? new Date(scheduledPublishAt) : null
  );
  const [publishTime, setPublishTime] = useState<string>(
    scheduledPublishAt ? format(new Date(scheduledPublishAt), "HH:mm") : ""
  );
  const [unpublishDate, setUnpublishDate] = useState<Date | null>(
    scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null
  );
  const [unpublishTime, setUnpublishTime] = useState<string>(
    scheduledUnpublishAt ? format(new Date(scheduledUnpublishAt), "HH:mm") : ""
  );
  const [currentTimezone, setCurrentTimezone] = useState<string>(timezone);

  useEffect(() => {
    if (publishDate && publishTime) {
      const [hours, minutes] = publishTime.split(":").map(Number);
      const date = new Date(publishDate);
      date.setHours(hours, minutes, 0, 0);
      onPublishChange(date);
    } else {
      onPublishChange(null);
    }
  }, [publishDate, publishTime]);

  useEffect(() => {
    if (unpublishDate && unpublishTime) {
      const [hours, minutes] = unpublishTime.split(":").map(Number);
      const date = new Date(unpublishDate);
      date.setHours(hours, minutes, 0, 0);
      onUnpublishChange(date);
    } else {
      onUnpublishChange(null);
    }
  }, [unpublishDate, unpublishTime]);

  useEffect(() => {
    onTimezoneChange(currentTimezone);
  }, [currentTimezone]);

  const clearPublish = () => {
    setPublishDate(null);
    setPublishTime("");
    onPublishChange(null);
  };

  const clearUnpublish = () => {
    setUnpublishDate(null);
    setUnpublishTime("");
    onUnpublishChange(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Scheduled Publish</Label>
        <div className="flex gap-2 mt-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !publishDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {publishDate ? format(publishDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={publishDate || undefined}
                onSelect={(date) => setPublishDate(date || null)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={publishTime}
            onChange={(e) => setPublishTime(e.target.value)}
            disabled={!publishDate}
            className="w-32"
          />
          {publishDate && (
            <Button variant="ghost" size="icon" onClick={clearPublish}>
              ×
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label>Scheduled Unpublish</Label>
        <div className="flex gap-2 mt-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !unpublishDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {unpublishDate ? format(unpublishDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={unpublishDate || undefined}
                onSelect={(date) => setUnpublishDate(date || null)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={unpublishTime}
            onChange={(e) => setUnpublishTime(e.target.value)}
            disabled={!unpublishDate}
            className="w-32"
          />
          {unpublishDate && (
            <Button variant="ghost" size="icon" onClick={clearUnpublish}>
              ×
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label>Timezone</Label>
        <Input
          value={currentTimezone}
          onChange={(e) => setCurrentTimezone(e.target.value)}
          placeholder="UTC"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
      </div>
    </div>
  );
};

export default ScheduledPublishForm;

