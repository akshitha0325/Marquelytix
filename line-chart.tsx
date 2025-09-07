import { useEffect, useRef } from "react";

interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  colors?: string[];
  loading?: boolean;
  hideGrid?: boolean;
  hideAxes?: boolean;
}

export default function LineChart({ 
  data, 
  xKey, 
  yKeys, 
  colors = ["#1B3C53"], 
  loading = false,
  hideGrid = false,
  hideAxes = false
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || loading || data.length === 0) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then(({ default: Chart }) => {
      const ctx = canvasRef.current!.getContext('2d')!;

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const datasets = yKeys.map((key, index) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data: data.map(item => item[key]),
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}20`,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      }));

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => item[xKey]),
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: !hideAxes,
              position: 'top' as const,
            },
          },
          scales: hideAxes ? {
            x: { display: false },
            y: { display: false }
          } : {
            x: {
              grid: {
                display: !hideGrid,
              },
            },
            y: {
              grid: {
                display: !hideGrid,
              },
              beginAtZero: true,
            },
          },
          elements: {
            point: {
              radius: hideAxes ? 0 : 3,
            },
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, xKey, yKeys, colors, loading, hideGrid, hideAxes]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
