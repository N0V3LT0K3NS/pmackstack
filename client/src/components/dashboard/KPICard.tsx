import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  format: "currency" | "number" | "percent" | "decimal";
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
      case "decimal":
        return val.toFixed(2);
      default:
        return val.toString();
    }
  };

  const isPositiveTrend = trend && trend > 0;
  const isGoodTrend = positiveIsGood ? isPositiveTrend : !isPositiveTrend;
  const trendMagnitude = Math.abs(trend || 0);
  
  // Determine trend significance for visual emphasis
  const isSignificantTrend = trendMagnitude > 5;
  const isMinorTrend = trendMagnitude > 0 && trendMagnitude <= 2;

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden border-0 shadow-sm", className)}>
        <CardHeader className="pb-3">
          <div className="h-4 w-28 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="h-9 w-36 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
      "bg-gradient-to-br from-white to-gray-50/50",
      isGoodTrend && isSignificantTrend && "ring-2 ring-green-100 hover:ring-green-200",
      !isGoodTrend && isSignificantTrend && "ring-2 ring-red-100 hover:ring-red-200",
      className
    )}>
      {/* Background accent based on trend */}
      {trend !== undefined && isSignificantTrend && (
        <div className={cn(
          "absolute top-0 right-0 w-1 h-full transition-all duration-300 group-hover:w-2",
          isGoodTrend ? "bg-gradient-to-b from-green-400 to-green-500" : "bg-gradient-to-b from-red-400 to-red-500"
        )} />
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Main Value */}
          <div className="flex items-baseline justify-between">
            <div className="space-y-1">
              <div className={cn(
                "font-bold tracking-tight transition-all duration-300 group-hover:scale-105",
                format === "currency" ? "text-3xl" : "text-2xl",
                "text-gray-900"
              )}>
                {formatValue(value)}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
              )}
            </div>
            
            {/* Trend Indicator */}
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-bold transition-all duration-300",
                "shadow-sm group-hover:shadow-md",
                isGoodTrend 
                  ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200" 
                  : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200"
              )}
            >
              {isSignificantTrend ? (
                isPositiveTrend ? (
                  <TrendingUpIcon className="h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4" />
                )
              ) : (
                isPositiveTrend ? (
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                )
              )}
              <span className="tabular-nums">
                {trendMagnitude.toFixed(1)}%
              </span>
            </div>
            )}
          </div>
          
          {/* Previous Period Comparison */}
          {previousValue !== undefined && (
            <div className={cn(
              "pt-3 border-t border-gray-100 transition-all duration-300",
              "group-hover:border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {trendLabel || "Previous Period"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 tabular-nums">
                    {formatValue(previousValue)}
                  </span>
                  {/* Change indicator */}
                  {value !== previousValue && (
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      value > previousValue ? "bg-green-400" : "bg-red-400"
                    )} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 