import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  format: "currency" | "number" | "percent";
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  positiveIsGood?: boolean;
}

export function KPICard({
  title,
  value,
  previousValue,
  format,
  trend,
  trendLabel,
  subtitle,
  loading = false,
  className,
  positiveIsGood = true,
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "number":
        return formatNumber(val);
      case "percent":
        return formatPercent(val);
      default:
        return val.toString();
    }
  };

  const isPositiveTrend = trend && trend > 0;
  const isGoodTrend = positiveIsGood ? isPositiveTrend : !isPositiveTrend;

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isGoodTrend ? "text-success-600" : "text-error-600"
              )}
            >
              {isPositiveTrend ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        {previousValue !== undefined && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {trendLabel || "Previous Period"}
              </span>
              <span className="font-medium">{formatValue(previousValue)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 