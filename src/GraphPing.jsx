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

const GraphPing = () => {
  const [pingHistory, setPingHistory] = useState([]);
  const serverAddressRef = useRef('http://localhost:3001/'); // https://node-ping-monitor.onrender.com/
  const timeoutInterval = useRef(0);
  const [useLast2min, setUseLast2min] = useState(false);
  const useLast2minRef = useRef(false);

  const socketRef = useRef(null);

  const updateChartData = (pingTime) => {
    useLast2minRef.current ? 
    setPingHistory(prevPingHistory => [...prevPingHistory, pingTime].slice(-120)) 
    : setPingHistory(prevPingHistory => [...prevPingHistory, pingTime]);
  };

  
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(serverAddressRef.current);
    }

    socketRef.current.on('pong', (pingTime) => {
      updateChartData(pingTime);
    });

    return () => {
      socketRef.current.off('pong');
      //socketRef.current.disconnect();
      clearInterval(timeoutInterval.current);
    };
    
  }, []);

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

  const startPing = () => {
    // Start pinging every 1 second
    timeoutInterval.current = setInterval(() => {
      const timestamp = Date.now();
      socketRef.current.emit('ping', timestamp);
    }, 1000);
  }
  
  const stopPing = () => {
    clearInterval(timeoutInterval.current);
    timeoutInterval.current = 0;
  };

  function handleChecked() {
    useLast2minRef.current = !useLast2minRef.current;
    setUseLast2min(useLast2minRef.current);
  }

  function prepServerChange(e) {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
    }
  
    // Update the server address
    serverAddressRef.current = e.target.value;
  
    // Create a new socket with the updated address
    socketRef.current = io(serverAddressRef.current);
  
    // Reattach the 'pong' event listener to the new socket
    socketRef.current.on('pong', (pingTime) => {
      updateChartData(pingTime);
    });
  
    // If pinging was active, restart it with the new socket
    if (timeoutInterval.current) {
      clearInterval(timeoutInterval.current);
      startPing();
    }
  }

  return (
    <>
    <div style={{position: 'absolute', marginTop: '40px', marginLeft: '40px'}}>

      {/* <input type="text" defaultValue={serverAddressRef.current} onChange={(e)=>handleTextChange(e)}/> */}

      <select onChange={(e) => prepServerChange(e) } defaultValue={serverAddressRef.current}>
        <option disabled>Select One</option>
        <option value="https://node-ping-monitor.onrender.com">https://node-ping-monitor.onrender.com</option>
        <option value="http://localhost:3001/">http://localhost:3001/</option>
      </select>

      <button onClick={startPing} style={{marginLeft: '10px'}}>Start Pinging</button>
      <button onClick={stopPing} style={{marginLeft: '10px'}}>Stop Pinging</button>
      <input type="checkbox" id="lastMinuteToggle" checked={useLast2min} onChange={handleChecked} style={{marginLeft: '10px'}}/>
      <label htmlFor="lastMinuteToggle"> Record last 2 min only.</label>
    </div>
            
    <div style={{width: "97%", textAlign: "center", display: "flex", justifyContent: "center"}}>
      <Line data={chartData} options={chartOptions} />
    </div>
    </>
  );
};

export default GraphPing;
