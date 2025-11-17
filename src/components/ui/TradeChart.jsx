import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function TradeChart({ tradeHistoryList }) {
  const chartData = useMemo(() => {
    const sortedData = [...tradeHistoryList].sort(
      (a, b) => new Date(a.purchasedAt) - new Date(b.purchasedAt)
    );

    return {
      labels: sortedData.map((item) => item.purchasedAt),
      datasets: [
        {
          label: "거래 시세 (원)",
          data: sortedData.map((item) => item.price),
          fill: false,
          borderColor: "#0761b4",
          tension: 0.1,
        },
      ],
    };
  }, [tradeHistoryList]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const date = new Date(context[0].label);
            return date.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          },
          label: function (context) {
            let label = "";

            if (context.parsed.y !== null) {
              label +=
                new Intl.NumberFormat("ko-KR").format(context.parsed.y) + "원";
            }
            return label;
          },
        },
      },
      title: {
        display: true,
        text: "최근 거래 시세",
        font: { size: "15" },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
          tooltipFormat: "yyyy.MM.dd",
          displayFormats: {
            day: "MM/dd",
          },
        },
        title: {
          display: true,
        },
      },
      y: {
        min: 0,
        title: {
          display: true,
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("ko-KR").format(value) + "원";
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "auto" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
