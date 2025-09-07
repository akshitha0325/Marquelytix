import { useEffect, useRef } from "react";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

export default function DonutChart({ data, loading = false }: DonutChartProps) {
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

      chartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.name),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: data.map(item => item.color),
            borderWidth: 0,
            hoverOffset: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                padding: 20,
                usePointStyle: true,
              },
            },
          },
          cutout: '70%',
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, loading]);

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
