import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import GraphTesting from './GraphTesting.jsx'
import GraphPing from './GraphPing.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GraphPing />
  </React.StrictMode>,
)
