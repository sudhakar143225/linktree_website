import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLinkHealth, useCheckLinkHealth } from "@/hooks/useLinkHealth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthCheckStatusProps {
  linkId: string;
  url: string;
  showButton?: boolean;
}

const HealthCheckStatus = ({ linkId, url, showButton = true }: HealthCheckStatusProps) => {
  const { data: healthCheck, isLoading } = useLinkHealth(linkId);
  const checkHealth = useCheckLinkHealth();

  const handleCheck = () => {
    checkHealth.mutate({ linkId, url });
  };

  if (isLoading && !healthCheck) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking...
      </Badge>
    );
  }

  const isHealthy = healthCheck?.is_healthy ?? null;
  const statusCode = healthCheck?.status_code;
  const errorMessage = healthCheck?.error_message;
  const responseTime = healthCheck?.response_time_ms;

  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let icon = <AlertCircle className="w-3 h-3" />;
  let label = "Unknown";

  if (isHealthy === true) {
    variant = "default";
    icon = <CheckCircle2 className="w-3 h-3" />;
    label = statusCode ? `Healthy (${statusCode})` : "Healthy";
  } else if (isHealthy === false) {
    variant = "destructive";
    icon = <XCircle className="w-3 h-3" />;
    label = "Unhealthy";
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={variant} className="gap-1">
              {icon}
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              {healthCheck && (
                <>
                  {statusCode && <div>Status: {statusCode}</div>}
                  {responseTime && <div>Response: {responseTime}ms</div>}
                  {errorMessage && <div>Error: {errorMessage}</div>}
                  {healthCheck.checked_at && (
                    <div>Last checked: {new Date(healthCheck.checked_at).toLocaleString()}</div>
                  )}
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        {showButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCheck}
            disabled={checkHealth.isPending}
            className="h-7 text-xs"
          >
            {checkHealth.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Checking
              </>
            ) : (
              "Check"
            )}
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};

export default HealthCheckStatus;

