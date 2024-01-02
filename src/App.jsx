import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [pingHistory, setPingHistory] = useState([]);
  const [serverAddress, setServerAddress] = useState('http://localhost:3001');
  const timeoutInterval = useRef(0);

  const socket = io(serverAddress);

  const updateChartData = (pingTime) => {
    const newPingHistory = [...pingHistory, pingTime];
    setPingHistory(newPingHistory.slice(-60)); // Keep only the last 60 data points (1 minute)
  };

  useEffect(() => {
    socket.on('pong', (pingTime) => {
      updateChartData(pingTime);
    });

    // Start pinging every 1 second
    timeoutInterval.current = setInterval(() => {
      const timestamp = Date.now();
      socket.emit('ping', timestamp);
    }, 1000);

    return () => {
      socket.off('pong');
      clearInterval(timeoutInterval.current);
    };
    
  }, [pingHistory]);

  const chartData = {
    labels: Array.from({ length: pingHistory.length }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Ping Time (ms)',
        data: pingHistory,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
    },
  };
  
  const stopPing = () => {
    clearInterval(timeoutInterval.current);
    timeoutInterval.current = null;
  };

  return (
    <div className="App">
      <h1>Ping App</h1>
      <input type="text" placeholder="Server Address" onChange={(e) => setServerAddress(e.target.value)}/>
      <button onClick={stopPing}>Stop Pinging</button>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default App;
