import {useState, useRef} from 'react';
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

export default function App() {
    const [pingHistory, setPingHistory] = useState([]);
    const [useLast2min, setUseLast2min] = useState(false);
    const intervalRef = useRef();
    const useLast2minRef = useRef(false);
    
    async function pingApp() {
        
        intervalRef.current = setInterval(() => {
            fetch('https://node-ping-monitor.onrender.com/ping/'+Date.now())
            .then(response => response.text())
            .then(data => {
                useLast2minRef.current ? 
                setPingHistory(prevPingHistory => [...prevPingHistory, data].slice(-120)) 
                : setPingHistory(prevPingHistory => [...prevPingHistory, data]);

            })
            .catch(error => console.error('Error:', error));
        }, 1000)
    }

    function clearPing() {
        clearInterval(intervalRef.current);
    }

    function handleChecked() {
        useLast2minRef.current = !useLast2minRef.current;
        setUseLast2min(useLast2minRef.current);
    }

    const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
        },
      };

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
    

    return (
        <>
            <div style={{position: 'absolute', marginTop: '10px', marginLeft: '40px'}}>
              <button onClick={pingApp}>Ping</button>
              <button onClick={clearPing} style={{marginLeft: '10px'}}>Stop</button>
              <input type="checkbox" id="lastMinuteToggle" checked={useLast2min} onChange={handleChecked} style={{marginLeft: '10px'}}/>
              <label htmlFor="lastMinuteToggle"> Record last 2 min only.</label>
            </div>
            <div style={{width: "97%", textAlign: "center", display: "flex", justifyContent: "center"}}>
              <Line data={chartData} options={chartOptions}/>
            </div>
        </>
    )
}